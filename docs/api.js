const dox = require('dox');
const fs = require('fs');

const files = [
  'lib/Action.js',
  'lib/Library.js'
];

let md = '';

for (const file of files) {
  const comments = dox.parseComments(fs.readFileSync(`./${file}`, 'utf8'), {
    raw: true
  });

  const name = file.replace('lib/', '').replace('.js', '').replace('/index', '');

  md += `# ${name}\n\n`;

  for (const comment of comments) {
    if (comment.ignore) {
      continue;
    }

    const ctx = comment.ctx || {};
    ctx.description = comment.description.full;
    for (const tag of comment.tags) {
      switch (tag.type) {
        case 'property':
          ctx.type = 'property';
          ctx.name = tag.string;
          ctx.string = `${ctx.constructor}.prototype.${ctx.name}`;
          break;
        case 'return':
          ctx.return = tag;
          break;
        case 'inherits':
          ctx[tag.type] = tag.string;
          break;
        case 'event':
        case 'param':
          ctx[tag.type] = (ctx[tag.type] || []);
          if (tag.types) {
            tag.types = tag.types.join('|');
          }
          ctx[tag.type].push(tag);
          break;
        case 'method':
          ctx.type = 'method';
          ctx.name = tag.string;
          ctx.string = `${ctx.constructor}.prototype.${ctx.name}()`;
          break;
        case 'memberOf':
          ctx.constructor = tag.parent;
          ctx.string = `${ctx.constructor}.prototype.${ctx.name}`;
          if (ctx.type === 'method') {
            ctx.string += '()';
          }
          break;
      }
    }

    md += `## ${ctx.string}\n\n`;
    if (ctx.params) {
      md += '#### Params\n\n';
      for (const param of ctx.params) {
        md += `${param.name} <${param.types}> ${param.description}\n\n`;
      }
    }
    if (ctx.return) {
      md += '#### Returns\n\n';
      md += `<${ctx.return.types}> ${ctx.return.description}\n\n`;
    }
    md += `${ctx.description}\n\n`;
  }
}

fs.writeFileSync('./api.md', md, 'utf8');
console.log('wrote to `api.md`');
