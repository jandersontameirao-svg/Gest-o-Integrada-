import {test,expect} from '@playwright/test';
// Browser test is synthetic and forbids remote application calls.
test('SGE original: objetivo, KPI, meta e Porter persistem após recarga e aprovação',async({page,context})=>{
 const external:string[]=[];await context.route('**/*',route=>{const u=new URL(route.request().url());if(!['127.0.0.1','localhost'].includes(u.hostname)){external.push(u.origin);return route.abort();}return route.continue();});
 await page.goto('/');await page.getByLabel('E-mail',{exact:true}).fill('holding@example.test');await page.getByLabel('Senha',{exact:true}).fill(process.env.DEMO_PASSWORD!);await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await page.getByRole('button',{name:'Gestão e Planejamento Estratégico',exact:true}).click();
 const workspace=page.locator('.sge');await expect(workspace.getByRole('heading',{name:'Planejamento Estratégico · SGE integrado'})).toBeVisible();
 await workspace.getByText('Novo plano plurianual',{exact:true}).click();await workspace.getByLabel('Título',{exact:true}).fill('Plano browser sintético');await workspace.getByLabel('Ano inicial').fill('2026');await workspace.getByLabel('Ano final').fill('2027');await workspace.getByRole('button',{name:'Criar plano',exact:true}).click();
 await expect(workspace.getByText('Versão 1 · Em elaboração.',{exact:false})).toBeVisible();
 await workspace.getByRole('button',{name:'Objetivos',exact:true}).click();await workspace.getByRole('button',{name:'Novo Objetivo',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Título *',{exact:true}).fill('Objetivo original persistente');await dialog.getByRole('button',{name:/Criar Objetivo|Salvar Objetivo|Criar$/}).click();
 await expect(workspace.getByRole('heading',{name:'Objetivo original persistente',exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Indicadores e valores',exact:true}).click();await workspace.getByRole('button',{name:/Novo KPI|Novo Indicador/}).click();await page.getByRole('dialog').getByLabel('Nome',{exact:false}).first().fill('KPI browser original');
 await page.getByRole('dialog').getByLabel('Unidade de Medida',{exact:false}).fill('unidades');await page.getByRole('dialog').getByRole('button',{name:/Criar KPI|Criar Indicador|Salvar$/}).click();
 await expect(workspace.getByText('KPI browser original',{exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Lançar Valores',exact:true}).click();await page.getByRole('dialog').getByLabel('Meta',{exact:true}).fill('100');await page.getByRole('dialog').getByLabel('Realizado',{exact:true}).fill('75');await page.getByRole('dialog').getByRole('button',{name:'Salvar',exact:true}).click();await expect(page.getByRole('dialog').getByText('75.0%',{exact:true})).toBeVisible();await page.getByRole('dialog').getByRole('button',{name:'Cancelar',exact:true}).click();
 await workspace.getByRole('button',{name:'Metas anuais',exact:true}).click();await workspace.getByLabel('Objetivo',{exact:true}).selectOption({label:'Objetivo original persistente'});await workspace.getByLabel('Meta anual',{exact:true}).fill('120');await workspace.getByRole('button',{name:'Salvar meta',exact:true}).click();await expect(workspace.getByText(/2026 · Objetivo original persistente · 120/)).toBeVisible();
 await workspace.getByRole('button',{name:'Metodologias',exact:true}).click();await workspace.getByText('5 Forças',{exact:true}).click();
 await workspace.getByPlaceholder(/Ex: Alta rivalidade/i).fill('Força browser persistida');await workspace.getByRole('button',{name:'Adicionar Força',exact:true}).click();await workspace.getByRole('button',{name:'Salvar Análise de 5 Forças',exact:true}).click();
 await expect(workspace.getByText('✓ Salvo automaticamente!',{exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Recarregar do banco',exact:true}).click();await workspace.getByText('5 Forças',{exact:true}).click();await expect(workspace.getByText('Força browser persistida',{exact:true})).toBeVisible();
 await workspace.getByText('PESTEL',{exact:true}).click();await workspace.getByPlaceholder(/Ex: Nova legislação/i).fill('Fator PESTEL browser persistente');await workspace.getByRole('button',{name:'Adicionar Fator',exact:true}).click();await workspace.getByRole('button',{name:'Salvar Análise PESTEL',exact:true}).click();await expect(workspace.getByText('✓ Salvo automaticamente!',{exact:true}).last()).toBeVisible();await workspace.getByRole('button',{name:'Recarregar do banco',exact:true}).click();await workspace.getByText('PESTEL',{exact:true}).click();await expect(workspace.getByText('Fator PESTEL browser persistente',{exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Objetivos',exact:true}).click();await expect(workspace.getByRole('heading',{name:'Objetivo original persistente',exact:true})).toBeVisible();
 await workspace.getByRole('button',{name:'Aprovar versão',exact:true}).click();await expect(workspace.getByText('Aprovado · baseline preservada',{exact:false})).toBeVisible();await expect(workspace.getByRole('button',{name:'Abrir revisão autorizada',exact:true})).toBeVisible();
 expect(external).toEqual([]);
 await page.screenshot({path:'test-results/sge-fluxo-aprovado.png',fullPage:true});
});
