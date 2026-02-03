import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { runSql } from '../../../../services/postgresService';

export async function POST(request: Request) {
  const secretHeader = request.headers.get('x-migrate-secret') || null;
  const body = await request.json().catch(() => ({}));
  const bodySecret = body?.secret || null;
  const secret = process.env.MIGRATE_SECRET;

  if (!secret || (secretHeader !== secret && bodySecret !== secret)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Read migrations directory
  const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    return NextResponse.json({ ok: false, error: 'migrations directory not found' });
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  const results: any[] = [];
  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const sql = fs.readFileSync(full, 'utf-8');
    try {
      const r = await runSql(sql);
      results.push({ file, ok: r.ok, error: r.error ?? null });
    } catch (e: any) {
      results.push({ file, ok: false, error: e?.message ?? String(e) });
    }
  }

  return NextResponse.json({ ok: true, results });
}
