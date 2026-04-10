import fs from 'node:fs';
import path from 'node:path';

/**
 * Gerador simples de PDF (sem dependências) usando sintaxe PDF.
 * Foco: relatório profissional com lista de usuários e permissões.
 *
 * Entrada: api/data/users.json
 * Saída:  RELATORIO_DE_ACESSO_GRUPO_RACA.pdf (raiz do projeto)
 */

const ROOT = process.cwd();
const USERS_JSON = path.join(ROOT, 'api', 'data', 'users.json');
const OUT_PDF = path.join(ROOT, 'RELATORIO_DE_ACESSO_GRUPO_RACA.pdf');

function readUsers() {
  if (!fs.existsSync(USERS_JSON)) return [];
  const raw = fs.readFileSync(USERS_JSON, 'utf8');
  const parsed = JSON.parse(raw);
  const users = Array.isArray(parsed?.users) ? parsed.users : [];
  // Nunca exportar password no relatório
  return users.map((u) => ({
    id: u?.id ?? '',
    name: u?.name ?? '',
    email: u?.email ?? '',
    role: u?.role ?? '',
    folder: u?.folder ?? '',
    permissions: u?.permissions ?? {},
  }));
}

function roleLabel(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'root') return 'ROOT';
  if (r === 'admin') return 'ADMIN';
  if (r === 'viewer') return 'VIEWER';
  if (r === 'assessor') return 'ASSESSOR';
  return 'USER';
}

function computeCapabilities(user) {
  const role = roleLabel(user.role);
  const p = user.permissions || {};

  const base = {
    view_scope: '',
    upload: false,
    download: false,
    delete: false,
    view_all: false,
    manage_users: false,
    manage_permissions: false,
    manage_auctions: false,
    notes: '',
  };

  if (role === 'ROOT') {
    return {
      ...base,
      view_scope: 'Acesso total (todas as pastas e módulos).',
      upload: true,
      download: true,
      delete: true,
      view_all: true,
      manage_users: true,
      manage_permissions: true,
      manage_auctions: true,
      notes: 'Perfil superadministrador (uso restrito).',
    };
  }

  if (role === 'ADMIN') {
    return {
      ...base,
      view_scope: 'Acesso amplo (todas as pastas e módulos operacionais).',
      upload: true,
      download: true,
      delete: true,
      view_all: true,
      manage_users: false,
      manage_permissions: false,
      manage_auctions: true,
      notes: 'Não gerencia usuários/permissões.',
    };
  }

  if (role === 'VIEWER') {
    return {
      ...base,
      view_scope: 'Visualiza todas as pastas.',
      upload: true,
      download: true,
      delete: false,
      view_all: true,
      manage_users: false,
      manage_permissions: false,
      manage_auctions: false,
      notes: 'Sem exclusão; sem gestão administrativa.',
    };
  }

  if (role === 'ASSESSOR') {
    return {
      ...base,
      view_scope: 'Visualiza pastas da raiz e a própria pasta (bloqueia pastas vinculadas a usuários).',
      upload: false, // condicional
      download: true,
      delete: false,
      view_all: true, // condicional na prática
      manage_users: false,
      manage_permissions: false,
      manage_auctions: false,
      notes: 'Upload apenas na própria pasta (ex.: ASSESSORES). Nunca pode deletar.',
    };
  }

  // USER (padrão)
  return {
    ...base,
    view_scope: 'Somente a própria pasta e subpastas.',
    upload: Boolean(p.upload),
    download: Boolean(p.download),
    delete: false,
    view_all: false,
    manage_users: false,
    manage_permissions: false,
    manage_auctions: false,
    notes: 'Permissões específicas por usuário. Sem exclusão.',
  };
}

function yesNo(v) {
  return v ? 'SIM' : 'NÃO';
}

function nowPtBr() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function pdfEscape(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
}

function wrapText(text, maxChars) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) {
      cur = w;
      continue;
    }
    if ((cur + ' ' + w).length <= maxChars) {
      cur += ' ' + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

class PdfBuilder {
  constructor() {
    this.objects = [];
  }

  addObject(str) {
    this.objects.push(str);
    return this.objects.length; // 1-based object number
  }

  build() {
    const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets = [0];
    let body = '';
    for (let i = 0; i < this.objects.length; i++) {
      offsets.push(header.length + body.length);
      body += `${i + 1} 0 obj\n${this.objects[i]}\nendobj\n`;
    }
    const xrefPos = header.length + body.length;
    let xref = `xref\n0 ${this.objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i++) {
      xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    const trailer = `trailer\n<< /Size ${this.objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
    return Buffer.from(header + body + xref + trailer, 'binary');
  }
}

function makePdf(users) {
  const pdf = new PdfBuilder();
  const pages = [];

  const A4_LANDSCAPE = { w: 842, h: 595 }; // points
  const margin = 36;

  // Reservar os primeiros objetos para manter referências corretas:
  // 1) Catalog
  // 2) Pages tree
  // 3) Font Helvetica
  // 4) Font Helvetica-Bold
  const catalogObjNum = pdf.addObject(''); // placeholder
  const pagesTreeObjNum = pdf.addObject(''); // placeholder
  const fontHelv = pdf.addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); // 3 0
  const fontHelvBold = pdf.addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'); // 4 0

  function pageContentCover() {
    const W = A4_LANDSCAPE.w;
    const H = A4_LANDSCAPE.h;
    const barH = 64;

    const lines = [];

    // Header bar (dark)
    lines.push('0 0 0 rg'); // fill black
    lines.push(`0 ${H - barH} ${W} ${barH} re f`);

    // Title (white)
    lines.push('1 1 1 rg');
    lines.push('BT');
    lines.push(`/F2 22 Tf`);
    lines.push(`1 0 0 1 ${margin} ${H - 42} Tm`);
    lines.push(`(${pdfEscape('Relatório de Acesso e Permissões')}) Tj`);
    lines.push('ET');

    // Subtitle
    lines.push('BT');
    lines.push(`/F1 12 Tf`);
    lines.push(`1 0 0 1 ${margin} ${H - 58} Tm`);
    lines.push(`(${pdfEscape('Grupo Raça — Sistema Interno')}) Tj`);
    lines.push('ET');

    // Body text
    const y0 = H - barH - 40;
    const body = [
      'Este documento apresenta, de forma objetiva, os perfis de acesso e o que cada usuário pode visualizar e executar no sistema.',
      'Ele pode ser compartilhado com o cliente como evidência de governança e controle de acesso.',
    ];
    let y = y0;
    lines.push('0 0 0 rg');
    for (const paragraph of body) {
      const wrapped = wrapText(paragraph, 110);
      for (const ln of wrapped) {
        lines.push('BT');
        lines.push('/F1 11 Tf');
        lines.push(`1 0 0 1 ${margin} ${y} Tm`);
        lines.push(`(${pdfEscape(ln)}) Tj`);
        lines.push('ET');
        y -= 15;
      }
      y -= 6;
    }

    // Meta box
    const boxY = y - 8;
    const boxH = 92;
    lines.push('0.97 0.97 0.97 rg');
    lines.push(`${margin} ${boxY - boxH} ${W - margin * 2} ${boxH} re f`);
    lines.push('0.85 0.85 0.85 RG');
    lines.push(`${margin} ${boxY - boxH} ${W - margin * 2} ${boxH} re S`);

    const meta = [
      ['Data', nowPtBr()],
      ['Cliente', '______________________________'],
      ['Responsável', '______________________________'],
    ];
    let my = boxY - 26;
    for (const [k, v] of meta) {
      lines.push('0 0 0 rg');
      lines.push('BT');
      lines.push('/F2 11 Tf');
      lines.push(`1 0 0 1 ${margin + 14} ${my} Tm`);
      lines.push(`(${pdfEscape(k + ':')}) Tj`);
      lines.push('ET');

      lines.push('BT');
      lines.push('/F1 11 Tf');
      lines.push(`1 0 0 1 ${margin + 120} ${my} Tm`);
      lines.push(`(${pdfEscape(v)}) Tj`);
      lines.push('ET');
      my -= 22;
    }

    // Footer note
    lines.push('0.35 0.35 0.35 rg');
    lines.push('BT');
    lines.push('/F1 9 Tf');
    lines.push(`1 0 0 1 ${margin} ${margin - 6} Tm`);
    lines.push(`(${pdfEscape('Gerado automaticamente a partir do cadastro de usuários do sistema.')}) Tj`);
    lines.push('ET');

    return lines.join('\n');
  }

  function pageContentUsers(startIdx) {
    const W = A4_LANDSCAPE.w;
    const H = A4_LANDSCAPE.h;

    const lines = [];

    // Header
    lines.push('0 0 0 rg');
    lines.push(`0 ${H - 54} ${W} 54 re f`);
    lines.push('1 1 1 rg');
    lines.push('BT');
    lines.push('/F2 16 Tf');
    lines.push(`1 0 0 1 ${margin} ${H - 36} Tm`);
    lines.push(`(${pdfEscape('Usuários e Permissões')}) Tj`);
    lines.push('ET');
    lines.push('BT');
    lines.push('/F1 10 Tf');
    lines.push(`1 0 0 1 ${margin} ${H - 50} Tm`);
    lines.push(`(${pdfEscape(`Atualizado em ${nowPtBr()}`)}) Tj`);
    lines.push('ET');

    // Table config
    const x0 = margin;
    const yTop = H - 70;
    const rowH = 20;
    const headerH = 22;
    const tableW = W - margin * 2;
    const cols = [
      { key: 'name', label: 'Usuário', w: 170 },
      { key: 'email', label: 'Email', w: 210 },
      { key: 'role', label: 'Perfil', w: 70 },
      { key: 'folder', label: 'Pasta', w: 80 },
      { key: 'caps', label: 'Permissões (resumo)', w: tableW - (170 + 210 + 70 + 80) },
    ];

    // Header background
    lines.push('0.95 0.95 0.95 rg');
    lines.push(`${x0} ${yTop - headerH} ${tableW} ${headerH} re f`);
    lines.push('0.80 0.80 0.80 RG');
    lines.push(`${x0} ${yTop - headerH} ${tableW} ${headerH} re S`);

    // Header text
    let cx = x0;
    for (const c of cols) {
      lines.push('0 0 0 rg');
      lines.push('BT');
      lines.push('/F2 10 Tf');
      lines.push(`1 0 0 1 ${cx + 6} ${yTop - 16} Tm`);
      lines.push(`(${pdfEscape(c.label)}) Tj`);
      lines.push('ET');
      cx += c.w;
    }

    // Vertical column lines
    let lx = x0;
    lines.push('0.85 0.85 0.85 RG');
    for (const c of cols) {
      lines.push(`${lx} ${yTop - headerH} m ${lx} ${margin} l S`);
      lx += c.w;
    }
    lines.push(`${x0 + tableW} ${yTop - headerH} m ${x0 + tableW} ${margin} l S`);

    // Rows
    const maxRows = Math.floor((yTop - headerH - margin - 10) / rowH);
    const slice = users.slice(startIdx, startIdx + maxRows);

    let y = yTop - headerH;
    for (let i = 0; i < slice.length; i++) {
      const u = slice[i];
      const caps = computeCapabilities(u);
      const role = roleLabel(u.role);
      const folder = u.folder || '';

      // Alternating row background
      if (i % 2 === 0) {
        lines.push('0.985 0.985 0.985 rg');
        lines.push(`${x0} ${y - rowH} ${tableW} ${rowH} re f`);
      }
      // Row border
      lines.push('0.90 0.90 0.90 RG');
      lines.push(`${x0} ${y - rowH} ${tableW} ${rowH} re S`);

      const resumo =
        `Ver: ${caps.view_scope} ` +
        `| Upload: ${caps.upload ? 'SIM' : role === 'ASSESSOR' ? 'COND.' : 'NÃO'} ` +
        `| Download: ${yesNo(caps.download)} ` +
        `| Deletar: ${yesNo(caps.delete)} ` +
        `| Usuários: ${yesNo(caps.manage_users)} ` +
        `| Leilões: ${yesNo(caps.manage_auctions)} ` +
        `| Obs.: ${caps.notes}`;

      const row = {
        name: u.name || '(sem nome)',
        email: u.email || '',
        role,
        folder,
        caps: resumo,
      };

      // Cell text
      let x = x0;
      const cells = [
        { text: row.name, w: cols[0].w, max: 26 },
        { text: row.email, w: cols[1].w, max: 32 },
        { text: row.role, w: cols[2].w, max: 10 },
        { text: row.folder, w: cols[3].w, max: 12 },
        { text: row.caps, w: cols[4].w, max: 95 },
      ];

      for (let ci = 0; ci < cells.length; ci++) {
        const c = cells[ci];
        const txt = String(c.text ?? '');
        const clipped = txt.length > c.max ? txt.slice(0, c.max - 1) + '…' : txt;
        lines.push('0 0 0 rg');
        lines.push('BT');
        lines.push('/F1 9 Tf');
        lines.push(`1 0 0 1 ${x + 6} ${y - 14} Tm`);
        lines.push(`(${pdfEscape(clipped)}) Tj`);
        lines.push('ET');
        x += c.w;
      }

      y -= rowH;
    }

    // Page footer
    lines.push('0.35 0.35 0.35 rg');
    lines.push('BT');
    lines.push('/F1 9 Tf');
    lines.push(`1 0 0 1 ${margin} ${margin - 6} Tm`);
    lines.push(`(${pdfEscape(`Total de usuários listados: ${users.length}`)}) Tj`);
    lines.push('ET');

    return { content: lines.join('\n'), rendered: slice.length };
  }

  // Page 1: cover
  {
    const content = pageContentCover();
    const stream = `<< /Length ${Buffer.byteLength(content, 'binary')} >>\nstream\n${content}\nendstream`;
    const contentObj = pdf.addObject(stream);
    const pageObj = pdf.addObject(
      `<< /Type /Page /Parent ${pagesTreeObjNum} 0 R /MediaBox [0 0 ${A4_LANDSCAPE.w} ${A4_LANDSCAPE.h}] ` +
      `/Resources << /Font << /F1 ${fontHelv} 0 R /F2 ${fontHelvBold} 0 R >> >> ` +
      `/Contents ${contentObj} 0 R >>`
    );
    pages.push(pageObj);
  }

  // Pages 2+: users
  let idx = 0;
  while (idx < users.length) {
    const { content, rendered } = pageContentUsers(idx);
    const stream = `<< /Length ${Buffer.byteLength(content, 'binary')} >>\nstream\n${content}\nendstream`;
    const contentObj = pdf.addObject(stream);
    const pageObj = pdf.addObject(
      `<< /Type /Page /Parent ${pagesTreeObjNum} 0 R /MediaBox [0 0 ${A4_LANDSCAPE.w} ${A4_LANDSCAPE.h}] ` +
      `/Resources << /Font << /F1 ${fontHelv} 0 R /F2 ${fontHelvBold} 0 R >> >> ` +
      `/Contents ${contentObj} 0 R >>`
    );
    pages.push(pageObj);
    idx += rendered;
    if (rendered <= 0) break;
  }

  // Preencher Pages tree (obj 2) e Catalog (obj 1) com referências corretas
  const kids = pages.map((n) => `${n} 0 R`).join(' ');
  pdf.objects[pagesTreeObjNum - 1] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;
  pdf.objects[catalogObjNum - 1] = `<< /Type /Catalog /Pages ${pagesTreeObjNum} 0 R >>`;

  return pdf.build();
}

const users = readUsers();
const pdfBytes = makePdf(users);
fs.writeFileSync(OUT_PDF, pdfBytes);
console.log(`PDF gerado em: ${OUT_PDF}`);

