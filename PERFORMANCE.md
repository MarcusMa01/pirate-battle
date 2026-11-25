# Pirate Battle — Evidências de desempenho

## Ambiente e origem

- Aplicação: [Pirate Battle](https://pirate-battle-mauve.vercel.app/)
- Data da coleta: 25/11/2026
- Ferramenta: Google Chrome DevTools, painel Performance, exportação TraceEvents
- Arquivo-fonte da medição: `pirate-battle-gameplay-profile.json`
- Hardware: navegador informa `hardwareConcurrency = 4`; CPU/GPU, RAM e versão do Chrome não identificadas no trace.
- Contexto: gravação com gameplay visível; a amostra também pode incluir transições e instrumentação do DevTools.

## Medição de cadência dos frames

Método: filtrar eventos `DrawFrame` do trace, ordenar por timestamp (`ts` em microssegundos), calcular diferenças consecutivas e converter para milissegundos. Percentis calculados com interpolação linear (NumPy).

| Métrica | Resultado |
|---|---:|
| Janela entre primeiro e último `DrawFrame` | 48,84 s |
| Eventos `DrawFrame` | 2.928 |
| Intervalos analisados | 2.927 |
| Intervalo médio | 16,69 ms |
| Intervalo mediano | 16,67 ms |
| P95 dos intervalos | 17,36 ms |
| P99 dos intervalos | 17,74 ms |
| Maior intervalo | 77,47 ms |
| Intervalos acima de 20 ms | 0,38% |
| Cadência média estimada | ~59,9 frames/s |

O trace também registra 4 eventos `DroppedFrame`. Esses eventos não devem ser confundidos com a quantidade de intervalos acima de 20 ms.

**Interpretação:** a cadência dos eventos de renderização é próxima de 60 FPS, com alguns intervalos mais longos. O P95 de 17,36 ms está ligeiramente acima do orçamento nominal de 16,67 ms para 60 FPS. A medição não prova 60 FPS constantes nem mede diretamente a taxa de apresentação na tela; a captura do DevTools pode introduzir overhead.

## Teste de memória — cinco partidas

**Data:** 25/11/2026  
**Ferramenta:** Google Chrome DevTools — Performance, com a opção Memory habilitada.  
**Aplicação:** versão publicada na Vercel.

### Procedimento

Foram realizadas cinco partidas completas durante uma gravação contínua, sem recarregar a página.

A duração total registrada foi de aproximadamente 2,7 minutos.

### Resultados observados

| Indicador | Resultado |
|---|---|
| Partidas completas | 5 |
| Duração da gravação | Aproximadamente 2,7 minutos |
| JS Heap | 8,2 a 10,6 MB |
| Nós do DOM | 92 a 196 |
| Event listeners | 169 a 521 |
| Comportamento da memória | Oscilações periódicas com quedas associadas à coleta de lixo |

### Análise

O gráfico de memória apresentou oscilações durante a execução, compatíveis com alocação de objetos e coleta de lixo pelo JavaScript.

Também foram observadas reduções na quantidade de event listeners durante determinadas transições.

**Conclusão:** o teste de cinco partidas foi executado e não apresentou evidência visual conclusiva de crescimento descontrolado da memória JavaScript. Entretanto, os dados disponíveis não permitem comprovar ausência de vazamentos, pois não foram comparados valores estabilizados após cada ciclo em condições equivalentes.

A análise deve ser considerada uma verificação preliminar de estabilidade de memória, e não uma comprovação definitiva de ausência de memory leaks.

## Verificações pendentes

- [ ] Partida contínua de 180 segundos com registro de entidades e desempenho.
- [x] Registro de memória durante cinco partidas completas.
- [ ] Comparação da memória estabilizada após cada ciclo, em condições equivalentes.
- [ ] Documentar navegador, sistema, CPU, GPU e memória RAM do dispositivo de teste.
- [ ] Registrar capturas de tela da execução e do perfil.

## Reprodutibilidade

No Chrome DevTools, abra **Performance**, grave uma partida em andamento e exporte o perfil. Os intervalos deste relatório são derivados dos timestamps dos eventos `DrawFrame`, e não dos tempos de tarefas JavaScript (`Task`) nem das métricas LCP/INP/CLS.
