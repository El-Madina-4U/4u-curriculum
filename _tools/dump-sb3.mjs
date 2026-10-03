// dump-sb3.mjs — يطبع سكربتات ملف .sb3 كنص مقروء (سبرايت ← سكربتات ← بلوكات)
// الاستخدام: node _tools/dump-sb3.mjs A-scratch/A1/checkpoints/P1-final.sb3 [ملفات أخرى]
import fs from 'node:fs';
import zlib from 'node:zlib';

export function unzip(file) {
  const buf = fs.readFileSync(file); const out = new Map();
  let p = buf.length - 22; while (p > 0 && buf.readUInt32LE(p) !== 0x06054b50) p--;
  const count = buf.readUInt16LE(p + 10); let cd = buf.readUInt32LE(p + 16);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(cd + 10), csize = buf.readUInt32LE(cd + 20), nlen = buf.readUInt16LE(cd + 28), elen = buf.readUInt16LE(cd + 30), clen = buf.readUInt16LE(cd + 32), lho = buf.readUInt32LE(cd + 42);
    const name = buf.slice(cd + 46, cd + 46 + nlen).toString();
    const lnlen = buf.readUInt16LE(lho + 26), lelen = buf.readUInt16LE(lho + 28);
    const start = lho + 30 + lnlen + lelen; const data = buf.slice(start, start + csize);
    out.set(name, method === 8 ? zlib.inflateRawSync(data) : Buffer.from(data));
    cd += 46 + nlen + elen + clen;
  }
  return out;
}

export function describe(project) {
  let out = '';
  for (const t of project.targets) {
    const B = t.blocks; const tops = Object.entries(B).filter(([, b]) => b.topLevel && !b.shadow);
    if (!tops.length) continue;
    out += `== ${t.name}${t.isStage ? ' (Stage)' : ''}\n`;
    const fmt = (id, ind) => {
      let s = ''; let cur = id;
      while (cur) {
        const b = B[cur]; if (!b) break;
        const ins = Object.entries(b.inputs || {}).filter(([k]) => !/^SUBSTACK/.test(k)).map(([k, v]) => {
          const s1 = v[1]; if (Array.isArray(s1)) return `${k}=${s1[1]}`;
          const sb = B[s1]; return sb ? `${k}=${Object.values(sb.fields || {}).map(x => x[0]).join(',') || sb.opcode}` : `${k}=?`;
        }).join(' ');
        const flds = Object.entries(b.fields || {}).map(([k, v]) => `${k}=${v[0]}`).join(' ');
        s += `${ind}${b.opcode}${ins ? ' [' + ins + ']' : ''}${flds ? ' {' + flds + '}' : ''}  #${cur}\n`;
        if (b.inputs?.SUBSTACK) s += fmt(b.inputs.SUBSTACK[1], ind + '    ');
        if (b.inputs?.SUBSTACK2) s += `${ind}  else\n` + fmt(b.inputs.SUBSTACK2[1], ind + '    ');
        cur = b.next;
      }
      return s;
    };
    for (const [id] of tops) out += fmt(id, '  ') + '  --\n';
  }
  return out;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  for (const f of process.argv.slice(2)) {
    console.log('#### ' + f);
    console.log(describe(JSON.parse(unzip(f).get('project.json').toString())));
  }
}
