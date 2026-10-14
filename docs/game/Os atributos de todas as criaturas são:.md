Os atributos de todas as criaturas são:

Vida
Ataque Físico
Ataque Mágico
Defesa Física
Defesa Mágica

Cada espécie (tipo) de criatura tem um determinado atributo base que são considerados nos calculos, isso independente do nível, atributos base são atributos base de cálculo, e.g. uma criatura da espécie A pode ter os atributos base:

Vida 22
Ataque Físico 10
Ataque Mágico 7
Defesa Física 8
Defesa Mágica 3

A cada nível esses atributos base são considerados nos cálculos.

Criaturas também tem PVs (potential values), ou, valores de potencial, são representados pelos mesmos atributos só que seus valores vão de 0% a 100%, são usados nos cálculos da mesma forma, a diferença é que PVs não são atrelados a espécie (tipo) e sim cada criatura pode ter um conjunto de PVs aleatórios, isso faz com que criaturas da mesma espécie e do mesmo nível sejam diferentes, a fórmula é a seguinte:

```Vida   = floor( (2×Base × Nível/100 + Nível + 10) × (0.75 + 0,5 × P/100) )```

```Outros = floor( (2×Base × Nível/100 + 5)          × (0.75 + 0,5 × P/100) )```

Ou seja, utilizando os atributos base a cima como exemplo, a mesma criatura com 0%, 50% e 100% de PV em cada atributo no nível 1 pode variar da seguinte forma:

| Atributo | Base | IV 0% | IV 50% | IV 100% |
|---|---|---|---|---|
| Vida | 22 | 16,5 (16) | 22 | 27,5 (27) |
| Ataque Físico | 10 | 7,5 (7) | 10 | 12,5 (12) |
| Ataque Mágico | 7 | 5,25 (5) | 7 | 8,75 (8) |
| Defesa Física | 8 | 6 | 8 | 10 |
| Defesa Mágica | 3 | 2,25 (2) | 3 | 3,75 (3) |

Existe outra medida que é apenas visual que é o MP (max potential), o MP na verdade é a soma dos 5 PVs dividido por 5, variando de 0% a 100%, indica o potencial máximo daquela criatura, criaturas com 100% de potencial significa que vão ter os atributos máximo daquela espécie ao chegar no nível máximo, mas nível máximo ainda não existe, é só para você entender a fórmula. Esse número é exibido na interface de toda a criatura e o treinador usa para identificar o potencial daquela criatura de forma fácil sem ter que analisar PVs um a um.

> PVs de criaturas iniciais são todos cravados no 50%, ou seja, a criatura inicial é sempre a criatura que representa o crú dos atributos base, uma vez que 50% de PV no nível 1 garante exatamente os atributos base da criatura.
