// .sb3-stats.mjs — ملخص إحصائى لملف .sb3: السبرايتات، المتغيرات، الرسائل،
// بلوكات My Blocks بمدخلاتها، وتكرار الأوبكودات المهمة.
// الاستخدام: node _tools/.sb3-stats.mjs <file.sb3> [<file.sb3> ...]
import { load } from './sb3.mjs';

const WATCH = [
  'control_create_clone_of', 'control_start_as_clone', 'control_delete_this_clone',
  'procedures_definition', 'procedures_call', 'argument_reporter_string_number',
  'argument_reporter_boolean',
  'operator_and', 'operator_or', 'operator_not', 'operator_join', 'operator_mod',
  'operator_random', 'operator_equals', 'operator_gt', 'operator_lt',
  'control_repeat_until', 'control_if', 'control_if_else', 'control_forever',
  'sensing_touchingcolor', 'sensing_touchingobject', 'sensing_distanceto',
  'sensing_askandwait', 'sensing_answer', 'sensing_mousex', 'sensing_mousey',
  'looks_seteffectto', 'looks_changeeffectby', 'looks_cleargraphiceffects',
  'looks_changesizeby', 'looks_setsizeto', 'looks_gotofrontback',
  'looks_goforwardbackwardlayers', 'looks_switchcostumeto',
  'motion_setrotationstyle', 'motion_glideto', 'motion_glidesecstoxy',
  'motion_changexby', 'motion_changeyby', 'motion_gotoxy', 'motion_goto',
  'music_playNoteForBeats', 'music_restForBeats', 'music_setInstrument',
  'music_setTempo', 'music_getTempo', 'music_playDrumForBeats',
  'event_broadcast', 'event_whenbroadcastreceived', 'event_whenthisspriteclicked',
  'pen_penDown', 'pen_stamp', 'data_setvariableto', 'data_changevariableby',
  'data_addtolist', 'data_itemoflist',
];

for (const file of process.argv.slice(2)) {
  const { project } = load(file);
  const count = new Map();
  const procs = [];
  const broadcasts = new Set();
  const vars = new Set();
  const lists = new Set();
  const sprites = [];

  for (const t of project.targets) {
    if (!t.isStage) sprites.push(`${t.name}(${(t.costumes || []).length}ك/${(t.sounds || []).length}ص)`);
    for (const [, v] of Object.entries(t.variables || {})) vars.add(v[0]);
    for (const [, v] of Object.entries(t.lists || {})) lists.add(v[0]);
    for (const [, v] of Object.entries(t.broadcasts || {})) broadcasts.add(v);
    for (const [, b] of Object.entries(t.blocks)) {
      if (!b || !b.opcode) continue;
      count.set(b.opcode, (count.get(b.opcode) || 0) + 1);
      if (b.opcode === 'procedures_prototype') {
        procs.push(`${t.name}: ${b.mutation.proccode}`);
      }
    }
  }

  console.log(`\n#### ${file}`);
  console.log(`سبرايتات (${sprites.length}): ${sprites.join(' · ')}`);
  if (vars.size) console.log(`متغيرات (${vars.size}): ${[...vars].join(' · ')}`);
  if (lists.size) console.log(`قوائم (${lists.size}): ${[...lists].join(' · ')}`);
  if (broadcasts.size) console.log(`رسائل (${broadcasts.size}): ${[...broadcasts].join(' · ')}`);
  if (procs.length) console.log(`My Blocks (${procs.length}):\n  ${procs.join('\n  ')}`);
  const hits = WATCH.filter(o => count.has(o)).map(o => `${o}×${count.get(o)}`);
  console.log(`أوبكودات: ${hits.join(' · ') || '—'}`);
  const other = [...count.keys()].filter(o => !WATCH.includes(o) && !/^(procedures_prototype|event_whenflagclicked|control_wait|looks_say|looks_think|motion_move|motion_turn|control_repeat|looks_show|looks_hide|sound_|math_|text_|colour_|note_|sensing_of_object_menu|looks_costume|motion_pointindirection|motion_xposition|motion_yposition|looks_size|operator_add|operator_subtract|operator_multiply|operator_divide)/.test(o));
  if (other.length) console.log(`أخرى: ${other.join(' · ')}`);
}
