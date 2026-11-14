import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
const app=express();
const origins=(process.env.CLIENT_ORIGIN||'http://localhost:5173,http://localhost:5174').split(',');
app.use(cors({origin:origins}));app.use(express.json({limit:'32kb'}));
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
const bad=(res,message)=>res.status(400).json({error:message});
const validate=x=>{
 const amount=Number(x.amount);
 if(typeof x.description!=='string'||!x.description.trim()||x.description.length>80)return 'Descripción inválida (máximo 80 caracteres)';
 if(!Number.isFinite(amount)||amount<=0||amount>999999999999)return 'Monto inválido';
 if(!['income','expense'].includes(x.type))return 'Tipo inválido';
 if(typeof x.category!=='string'||!x.category.trim()||x.category.length>60)return 'Categoría inválida';
 if(typeof x.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||Number.isNaN(Date.parse(x.date)))return 'Fecha inválida';
 return null;
};
const fields=`id, description, amount::float8 AS amount, type, category, to_char(date, 'YYYY-MM-DD') AS date`;
app.get('/api/health',wrap(async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok',database:'postgresql'})}));
app.get('/api/transactions',wrap(async(req,res)=>{const r=await pool.query(`SELECT ${fields} FROM transactions ORDER BY date DESC,id DESC`);res.json(r.rows)}));
app.post('/api/transactions',wrap(async(req,res)=>{const x=req.body;const err=validate(x);if(err)return bad(res,err);const r=await pool.query(`INSERT INTO transactions(description,amount,type,category,date) VALUES($1,$2,$3,$4,$5) RETURNING ${fields}`,[x.description.trim(),Number(x.amount),x.type,x.category.trim(),x.date]);res.status(201).json(r.rows[0])}));
app.put('/api/transactions/:id',wrap(async(req,res)=>{const x=req.body;const err=validate(x);if(err)return bad(res,err);if(!/^\d+$/.test(req.params.id))return bad(res,'ID inválido');const r=await pool.query(`UPDATE transactions SET description=$1,amount=$2,type=$3,category=$4,date=$5 WHERE id=$6 RETURNING ${fields}`,[x.description.trim(),Number(x.amount),x.type,x.category.trim(),x.date,req.params.id]);if(!r.rowCount)return res.status(404).json({error:'Transacción no encontrada'});res.json(r.rows[0])}));
app.delete('/api/transactions/:id',wrap(async(req,res)=>{if(!/^\d+$/.test(req.params.id))return bad(res,'ID inválido');const r=await pool.query('DELETE FROM transactions WHERE id=$1',[req.params.id]);if(!r.rowCount)return res.status(404).json({error:'Transacción no encontrada'});res.status(204).end()}));
app.get('/api/favorites',wrap(async(req,res)=>{const r=await pool.query('SELECT * FROM github_favorites ORDER BY created_at DESC');res.json(r.rows)}));
app.post('/api/favorites',wrap(async(req,res)=>{const x=req.body;if(!Number.isSafeInteger(x.github_id)||x.github_id<=0||typeof x.full_name!=='string'||!x.full_name.trim()||x.full_name.length>255||typeof x.html_url!=='string'||!/^https:\/\/github\.com\//.test(x.html_url))return bad(res,'Datos de repositorio inválidos');const r=await pool.query('INSERT INTO github_favorites(github_id,full_name,html_url,description,language,stars) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(github_id) DO UPDATE SET full_name=EXCLUDED.full_name,html_url=EXCLUDED.html_url,description=EXCLUDED.description,language=EXCLUDED.language,stars=EXCLUDED.stars RETURNING *',[x.github_id,x.full_name,x.html_url,x.description||null,x.language||null,Number.isSafeInteger(x.stars)&&x.stars>=0?x.stars:0]);res.status(201).json(r.rows[0])}));
app.delete('/api/favorites/:githubId',wrap(async(req,res)=>{if(!/^\d+$/.test(req.params.githubId))return bad(res,'ID inválido');await pool.query('DELETE FROM github_favorites WHERE github_id=$1',[req.params.githubId]);res.status(204).end()}));
// DevInsight: perfiles favoritos (las estadísticas se consultan en tiempo real a GitHub).
app.get('/api/profiles',wrap(async(req,res)=>{const r=await pool.query('SELECT * FROM github_profiles ORDER BY saved_at DESC');res.json(r.rows)}));
app.post('/api/profiles',wrap(async(req,res)=>{
 const x=req.body||{};
 if(!Number.isSafeInteger(x.github_id)||x.github_id<=0||typeof x.login!=='string'||!/^[a-zA-Z0-9-]{1,39}$/.test(x.login)||typeof x.html_url!=='string'||!/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/?$/.test(x.html_url))return bad(res,'Perfil de GitHub inválido');
 const r=await pool.query(`INSERT INTO github_profiles(github_id,login,name,avatar_url,html_url,followers,public_repos) VALUES($1,$2,$3,$4,$5,$6,$7)
 ON CONFLICT(github_id) DO UPDATE SET login=EXCLUDED.login,name=EXCLUDED.name,avatar_url=EXCLUDED.avatar_url,html_url=EXCLUDED.html_url,followers=EXCLUDED.followers,public_repos=EXCLUDED.public_repos RETURNING *`,[x.github_id,x.login,typeof x.name==='string'?x.name.slice(0,255):null,typeof x.avatar_url==='string'&&x.avatar_url.startsWith('https://avatars.githubusercontent.com/')?x.avatar_url:null,x.html_url,Number.isSafeInteger(x.followers)&&x.followers>=0?x.followers:0,Number.isSafeInteger(x.public_repos)&&x.public_repos>=0?x.public_repos:0]);res.status(201).json(r.rows[0]);
}));
app.delete('/api/profiles/:githubId',wrap(async(req,res)=>{if(!/^\d+$/.test(req.params.githubId))return bad(res,'ID inválido');const r=await pool.query('DELETE FROM github_profiles WHERE github_id=$1',[req.params.githubId]);if(!r.rowCount)return res.status(404).json({error:'Perfil no encontrado'});res.status(204).end()}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Error interno del servidor. Revisa la conexión a PostgreSQL.'})});
app.listen(Number(process.env.PORT)||4000,()=>console.log('API disponible en http://localhost:'+(process.env.PORT||4000)));
