const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const URL = `http://localhost:${PORT}`;
const NUMERO_TESTES = 5; // Número de testes para calcular média

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisição HTTP
function fazerRequisicao(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    let data = '';
    let headers = {};
    let statusCode = 0;

    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      statusCode = res.statusCode;
      headers = res.headers;
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const totalTime = performance.now() - startTime;
        resolve({
          statusCode,
          headers,
          data,
          responseTime, // Tempo até primeiro byte (TTFB)
          totalTime,    // Tempo total de carregamento
          size: Buffer.byteLength(data, 'utf8'),
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout após 30 segundos'));
    });
  });
}

// Função para analisar o HTML e encontrar recursos
function analisarRecursos(html) {
  const recursos = {
    imagens: [],
    scripts: [],
    stylesheets: [],
    fonts: [],
    outros: [],
  };

  // Encontrar imagens
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    recursos.imagens.push(match[1]);
  }

  // Encontrar scripts
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  while ((match = scriptRegex.exec(html)) !== null) {
    recursos.scripts.push(match[1]);
  }

  // Encontrar stylesheets
  const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    recursos.stylesheets.push(match[1]);
  }

  // Encontrar fontes
  const fontRegex = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["'](?:stylesheet|preconnect|dns-prefetch)["'][^>]*>/gi;
  while ((match = fontRegex.exec(html)) !== null) {
    if (match[1].includes('font') || match[1].includes('googleapis')) {
      recursos.fonts.push(match[1]);
    }
  }

  return recursos;
}

// Função para calcular estatísticas
function calcularEstatisticas(resultados) {
  const tempos = resultados.map(r => r.totalTime);
  const ttfb = resultados.map(r => r.responseTime);
  const tamanhos = resultados.map(r => r.size);

  return {
    media: {
      tempoTotal: tempos.reduce((a, b) => a + b, 0) / tempos.length,
      ttfb: ttfb.reduce((a, b) => a + b, 0) / ttfb.length,
      tamanho: tamanhos.reduce((a, b) => a + b, 0) / tamanhos.length,
    },
    min: {
      tempoTotal: Math.min(...tempos),
      ttfb: Math.min(...ttfb),
      tamanho: Math.min(...tamanhos),
    },
    max: {
      tempoTotal: Math.max(...tempos),
      ttfb: Math.max(...ttfb),
      tamanho: Math.max(...tamanhos),
    },
  };
}

// Função para formatar bytes
function formatarBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Função para formatar tempo
function formatarTempo(ms) {
  if (ms < 1000) return ms.toFixed(2) + ' ms';
  return (ms / 1000).toFixed(2) + ' s';
}

// Função para avaliar performance
function avaliarPerformance(tempoTotal, ttfb) {
  let status = '';
  let cor = '';

  if (tempoTotal < 1000 && ttfb < 200) {
    status = 'EXCELENTE ⚡';
    cor = 'green';
  } else if (tempoTotal < 2000 && ttfb < 500) {
    status = 'BOM ✅';
    cor = 'green';
  } else if (tempoTotal < 3000 && ttfb < 1000) {
    status = 'REGULAR ⚠️';
    cor = 'yellow';
  } else {
    status = 'LENTO ❌';
    cor = 'red';
  }

  return { status, cor };
}

// Função principal
async function testarPerformance() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  TESTE DE PERFORMANCE - VITALITYFLOW', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  log(`Testando: ${URL}`, 'blue');
  log(`Número de testes: ${NUMERO_TESTES}\n`, 'blue');

  const resultados = [];
  let recursos = null;

  // Executar múltiplos testes
  for (let i = 0; i < NUMERO_TESTES; i++) {
    try {
      log(`Teste ${i + 1}/${NUMERO_TESTES}...`, 'yellow');
      const resultado = await fazerRequisicao(URL);
      resultados.push(resultado);

      if (i === 0) {
        recursos = analisarRecursos(resultado.data);
      }

      log(`  ✓ Tempo total: ${formatarTempo(resultado.totalTime)}`, 'green');
      log(`  ✓ TTFB: ${formatarTempo(resultado.responseTime)}`, 'green');
      log(`  ✓ Tamanho: ${formatarBytes(resultado.size)}\n`, 'green');
    } catch (error) {
      log(`  ✗ Erro no teste ${i + 1}: ${error.message}`, 'red');
      log(`  Verifique se o servidor está rodando na porta ${PORT}\n`, 'yellow');
      return;
    }
  }

  // Calcular estatísticas
  const stats = calcularEstatisticas(resultados);
  const avaliacao = avaliarPerformance(stats.media.tempoTotal, stats.media.ttfb);

  // Exibir resultados
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  RESULTADOS DO TESTE', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  log('📊 ESTATÍSTICAS GERAIS:', 'bright');
  log(`   Tempo Total (média): ${formatarTempo(stats.media.tempoTotal)}`, 'cyan');
  log(`   Tempo Total (min):   ${formatarTempo(stats.min.tempoTotal)}`, 'cyan');
  log(`   Tempo Total (max):   ${formatarTempo(stats.max.tempoTotal)}`, 'cyan');
  log(`   TTFB (média):        ${formatarTempo(stats.media.ttfb)}`, 'cyan');
  log(`   Tamanho (média):     ${formatarBytes(stats.media.tamanho)}`, 'cyan');

  log(`\n🎯 AVALIAÇÃO: `, 'bright');
  log(`   ${avaliacao.status}`, avaliacao.cor);

  // Análise de recursos
  if (recursos) {
    log('\n📦 RECURSOS ENCONTRADOS:', 'bright');
    log(`   Imagens:      ${recursos.imagens.length}`, 'cyan');
    log(`   Scripts:      ${recursos.scripts.length}`, 'cyan');
    log(`   Stylesheets: ${recursos.stylesheets.length}`, 'cyan');
    log(`   Fontes:       ${recursos.fonts.length}`, 'cyan');
    log(`   Total:        ${recursos.imagens.length + recursos.scripts.length + recursos.stylesheets.length + recursos.fonts.length} recursos externos`, 'cyan');
  }

  // Recomendações
  log('\n💡 RECOMENDAÇÕES:', 'bright');
  
  if (stats.media.tempoTotal > 2000) {
    log('   ⚠️  Tempo de carregamento acima de 2s - considere otimizar', 'yellow');
  }
  
  if (stats.media.ttfb > 500) {
    log('   ⚠️  TTFB alto - verifique a latência do servidor', 'yellow');
  }

  if (stats.media.tamanho > 500 * 1024) {
    log('   ⚠️  Página acima de 500KB - considere minificar HTML/CSS', 'yellow');
  }

  if (recursos && recursos.imagens.length > 10) {
    log('   ⚠️  Muitas imagens - considere lazy loading ou otimização', 'yellow');
  }

  if (stats.media.tempoTotal < 1000 && stats.media.ttfb < 200) {
    log('   ✅ Performance excelente! Mantenha as otimizações.', 'green');
  }

  log('\n═══════════════════════════════════════════════════════════\n', 'cyan');
}

// Verificar se o servidor está rodando
async function verificarServidor() {
  try {
    await fazerRequisicao(URL);
    return true;
  } catch (error) {
    return false;
  }
}

// Executar teste
(async () => {
  log('Verificando se o servidor está rodando...', 'yellow');
  const servidorRodando = await verificarServidor();
  
  if (!servidorRodando) {
    log(`\n❌ Servidor não está rodando na porta ${PORT}!`, 'red');
    log('\nPara iniciar o servidor, execute:', 'yellow');
    log('   node servir-pagina.js', 'cyan');
    log('   ou', 'yellow');
    log('   cd pagina && node server.js', 'cyan');
    log('\nDepois execute este script novamente.\n', 'yellow');
    process.exit(1);
  }

  await testarPerformance();
})();


