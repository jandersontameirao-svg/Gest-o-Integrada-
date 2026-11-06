import {test,expect} from '@playwright/test';
// Browser test is synthetic and forbids remote application calls.
test('SGE original: objetivo, KPI, meta e Porter persistem após recarga e aprovação',async({page,context})=>{
 const runtimeErrors:string[]=[];page.on('pageerror',error=>runtimeErrors.push(error.message));
 const external:string[]=[];await context.route('**/*',route=>{const u=new URL(route.request().url());if(!['127.0.0.1','localhost'].includes(u.hostname)){external.push(u.origin);return route.abort();}return route.continue();});
 await page.goto('/');await page.getByLabel('E-mail',{exact:true}).fill('holding@example.test');await page.getByLabel('Senha',{exact:true}).fill(process.env.DEMO_PASSWORD!);await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await page.getByRole('button',{name:'Gestão e Planejamento Estratégico',exact:true}).click();
 const workspace=page.locator('.sge');await expect(workspace.getByRole('heading',{name:'Planejamento Estratégico · SGE integrado'})).toBeVisible();
 await workspace.getByText('Novo plano plurianual',{exact:true}).click();await workspace.getByLabel('Título',{exact:true}).fill('Plano browser sintético');await workspace.getByLabel('Ano inicial').fill('2026');await workspace.getByLabel('Ano final').fill('2027');await workspace.getByRole('button',{name:'Criar plano',exact:true}).click();
 await expect(workspace.getByText('Versão 1 · Em elaboração.',{exact:false})).toBeVisible();
 await workspace.getByRole('button',{name:'Objetivos',exact:true}).click();await workspace.getByRole('button',{name:'Novo Objetivo',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Título *',{exact:true}).fill('Objetivo original persistente');await dialog.getByRole('button',{name:/Criar Objetivo|Salvar Objetivo|Criar$/}).click();
 await expect(workspace.getByRole('heading',{name:'Objetivo original persistente',exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Editar objetivo Objetivo original persistente',exact:true}).click();await page.getByRole('dialog').getByLabel('Título *',{exact:true}).fill('Objetivo original editado');await page.getByRole('dialog').getByRole('button',{name:'Atualizar',exact:true}).click();await expect(workspace.getByRole('heading',{name:'Objetivo original editado',exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Indicadores e valores',exact:true}).click();await workspace.getByRole('button',{name:/Novo KPI|Novo Indicador/}).first().click();await page.getByRole('dialog').getByLabel('Nome',{exact:false}).first().fill('KPI browser original');
 await page.getByRole('dialog').getByLabel('Unidade de Medida',{exact:false}).fill('unidades');await page.getByRole('dialog').getByRole('button',{name:/Criar KPI|Criar Indicador|Salvar$/}).click();
 await expect(workspace.getByText('KPI browser original',{exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Lançar Valores',exact:true}).click();await page.getByRole('dialog').getByLabel('Meta',{exact:true}).fill('100');await page.getByRole('dialog').getByLabel('Realizado',{exact:true}).fill('75');await page.getByRole('dialog').getByRole('button',{name:'Salvar',exact:true}).click();await expect(page.getByRole('dialog').getByText('75.0%',{exact:true})).toBeVisible();await page.getByRole('dialog').getByRole('button',{name:'Cancelar',exact:true}).click();
 await workspace.getByRole('button',{name:'Metas anuais',exact:true}).click();await workspace.getByLabel('Objetivo',{exact:true}).selectOption({label:'Objetivo original editado'});await workspace.getByLabel('Meta anual',{exact:true}).fill('120');await workspace.getByRole('button',{name:'Salvar meta',exact:true}).click();await expect(workspace.getByText(/2026 · Objetivo original editado · 120/)).toBeVisible();
 await workspace.getByRole('button',{name:'Metodologias',exact:true}).click();await workspace.getByText('5 Forças',{exact:true}).click();
 await workspace.getByPlaceholder(/Ex: Alta rivalidade/i).fill('Força browser persistida');await workspace.getByRole('button',{name:'Adicionar Força',exact:true}).click();await workspace.getByRole('button',{name:'Salvar Análise de 5 Forças',exact:true}).click();
 await expect(workspace.getByText('✓ Salvo automaticamente!',{exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Recarregar do banco',exact:true}).click();await workspace.getByText('5 Forças',{exact:true}).click();await expect(workspace.getByText('Força browser persistida',{exact:true})).toBeVisible();
 await workspace.getByText('PESTEL',{exact:true}).click();await workspace.getByPlaceholder(/Ex: Nova legislação/i).fill('Fator PESTEL browser persistente');await workspace.getByRole('button',{name:'Adicionar Fator',exact:true}).click();await workspace.getByRole('button',{name:'Salvar Análise PESTEL',exact:true}).click();await expect(workspace.getByText('✓ Salvo automaticamente!',{exact:true}).last()).toBeVisible();await workspace.getByRole('button',{name:'Recarregar do banco',exact:true}).click();await workspace.getByText('PESTEL',{exact:true}).click();await expect(workspace.getByText('Fator PESTEL browser persistente',{exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Objetivos',exact:true}).click();await expect(workspace.getByRole('heading',{name:'Objetivo original editado',exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Aprovar versão',exact:true}).click();await expect(workspace.getByText('Aprovado · baseline preservada',{exact:false})).toBeVisible();await expect(workspace.getByRole('button',{name:'Abrir revisão autorizada',exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/sge-holding-aprovado.png',fullPage:true});
 async function openScope(value:string,title:string){
  await Promise.all([page.waitForResponse(r=>{const u=new URL(r.url());return u.pathname.endsWith('/strategy/plans')&&u.searchParams.get('scopeId')===value;}),workspace.getByLabel('Holding, unidade ou empresa',{exact:true}).selectOption(value)]);
  const details=workspace.locator('details').filter({has:workspace.getByText('Novo plano plurianual',{exact:true})});
  if(!await workspace.getByLabel('Título',{exact:true}).isVisible())await workspace.getByText('Novo plano plurianual',{exact:true}).click();
  await workspace.getByLabel('Título',{exact:true}).fill(title);await workspace.getByLabel('Ano inicial').fill('2026');await workspace.getByLabel('Ano final').fill('2026');await workspace.getByRole('button',{name:'Criar plano',exact:true}).click();
  await workspace.getByRole('button',{name:'Painel',exact:true}).click();
 }
 await openScope('scope-unit:arqueo','Plano unitário browser sintético');await expect(workspace.getByRole('heading',{name:'Dashboard de Análises - Arqueo',exact:true})).toBeVisible();await page.screenshot({path:'test-results/sge-unidade.png',fullPage:true});
 await openScope('scope-company:arqueoproject','Plano empresa browser sintético');await expect(workspace.getByRole('heading',{name:'Dashboard Executivo',exact:true})).toBeVisible();await page.screenshot({path:'test-results/sge-empresa.png',fullPage:true});
 expect(external).toEqual([]);expect(runtimeErrors).toEqual([]);
 await page.screenshot({path:'test-results/sge-fluxo-aprovado.png',fullPage:true});
});
