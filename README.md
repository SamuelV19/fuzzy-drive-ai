# FuzzyDrive AI — Simulador de riesgo vial con lógica difusa Mamdani

Aplicación web educativa que evalúa en tiempo real el riesgo vial de una situación **simulada** con un motor de inferencia difusa Mamdani implementado desde cero (sin librerías de lógica difusa, sin pesos fijos y sin backend).

## Instalación y ejecución

```bash
npm install
npm run dev      # servidor local (http://localhost:5173)
npm test         # pruebas unitarias (Vitest)
npm run build    # comprobación de tipos + build de producción
```

Requiere Node.js 18 o superior.

## Arquitectura

```
src/
  fuzzy/
    membership.ts   funciones triangular y trapezoidal (+ validación)
    variables.ts    variables lingüísticas y conjuntos difusos (entradas y salida)
    rules.ts        base de 27 reglas IF-THEN
    inference.ts    fuzzificación, activación, implicación, agregación, centroide, categoría
  sim/
    scenarios.ts    escenarios, secuencia de demo y generador aleatorio (rng inyectable)
    useSimulation.ts  hook con un único temporizador (setInterval limpiado en el cleanup)
  components/       medidor, tarjetas, gráficas, explorador difuso, controles, registro
```

El motor no depende de React: se puede probar y explicar de forma independiente. La UI solo llama a `inferRisk(entrada)`.

## Fundamentos matemáticos

Una variable lingüística se describe con conjuntos difusos definidos por funciones de pertenencia μ: U → [0,1].

- Triangular (a,b,c): sube linealmente de a a b y baja de b a c.
- Trapezoidal (a,b,c,d): meseta de pertenencia 1 entre b y c.

| Variable | Universo | Conjuntos (parámetros) |
|---|---|---|
| Velocidad (km/h) | 0–140 | baja trap(0,0,30,60) · media tri(40,70,100) · alta trap(80,110,140,140) |
| Distancia (m) | 1–100 | cercana trap(1,1,10,30) · intermedia tri(15,40,70) · lejana trap(50,75,100,100) |
| Adversidad de vía | 0–100 | favorable trap(0,0,20,45) · regular tri(30,50,70) · adversa trap(55,80,100,100) |
| Riesgo (salida) | 0–100 | bajo trap(0,0,15,30) · moderado tri(20,40,60) · alto tri(50,65,80) · muy alto trap(70,85,100,100) |

### Proceso de inferencia

1. **Fuzzificación**: cada entrada nítida se convierte en grados de pertenencia a sus tres conjuntos.
2. **Activación**: para cada regla, α = min(μ_velocidad, μ_distancia, μ_vía) (AND por mínimo).
3. **Implicación**: cada regla recorta su conjunto de salida: min(α, μ_salida(x)).
4. **Agregación**: μ_agregada(x) = max sobre todas las reglas.
5. **Desfusificación (centroide)**: riesgo = Σ x·μ_agregada(x) / Σ μ_agregada(x), con x en pasos de 0,25 (401 puntos).
6. **Categoría**: el conjunto de salida con mayor pertenencia al valor desfusificado (en empate, el más severo).

Casos degenerados: las entradas se validan (NaN, infinitos y valores fuera de rango lanzan `RangeError`). Si el área agregada fuera nula, el motor devuelve el valor neutro 50 y marca `degenerate = true` (con esta base de reglas completa y los conjuntos definidos no ocurre, y hay una prueba que lo verifica).

## Base de reglas (27)

Criterio de construcción: cada antecedente aporta un nivel de peligro de 0 a 2 (velocidad baja=0, media=1, alta=2; distancia lejana=0, intermedia=1, cercana=2; vía favorable=0, regular=1, adversa=2). Con la suma s: s ≤ 1 → bajo; 2–3 → moderado; 4 → alto; ≥ 5 → muy alto. Es conocimiento experto declarado como reglas; el resultado numérico lo calcula el motor y no se fija a mano.

| Regla | Velocidad | Distancia | Vía | Riesgo |
|---|---|---|---|---|
| R01 | baja | lejana | favorable | bajo |
| R02 | baja | lejana | regular | bajo |
| R03 | baja | lejana | adversa | moderado |
| R04 | baja | intermedia | favorable | bajo |
| R05 | baja | intermedia | regular | moderado |
| R06 | baja | intermedia | adversa | moderado |
| R07 | baja | cercana | favorable | moderado |
| R08 | baja | cercana | regular | moderado |
| R09 | baja | cercana | adversa | alto |
| R10 | media | lejana | favorable | bajo |
| R11 | media | lejana | regular | moderado |
| R12 | media | lejana | adversa | moderado |
| R13 | media | intermedia | favorable | moderado |
| R14 | media | intermedia | regular | moderado |
| R15 | media | intermedia | adversa | alto |
| R16 | media | cercana | favorable | moderado |
| R17 | media | cercana | regular | alto |
| R18 | media | cercana | adversa | muy alto |
| R19 | alta | lejana | favorable | moderado |
| R20 | alta | lejana | regular | moderado |
| R21 | alta | lejana | adversa | alto |
| R22 | alta | intermedia | favorable | moderado |
| R23 | alta | intermedia | regular | alto |
| R24 | alta | intermedia | adversa | muy alto |
| R25 | alta | cercana | favorable | alto |
| R26 | alta | cercana | regular | muy alto |
| R27 | alta | cercana | adversa | muy alto |

## Lógica difusa frente a aprendizaje automático

| | Lógica difusa (este proyecto) | Aprendizaje automático |
|---|---|---|
| Conocimiento | Reglas escritas por un experto | Se aprende de datos |
| Datos necesarios | Ninguno para funcionar | Muchos datos etiquetados |
| Explicabilidad | Alta: se ve qué reglas se activan y con qué grado | Variable; a menudo baja |
| Ajuste | Manual (conjuntos y reglas) | Automático (entrenamiento) |

Este sistema **no aprende**: su comportamiento depende solo de las reglas y funciones de pertenencia definidas.

## Ejemplos de uso

- **Automático**: «Iniciar» genera entradas aleatorias válidas cada 1, 3 o 5 s.
- **Manual**: mueve los sliders; el medidor se actualiza al instante. «Registrar lectura» la guarda en el historial.
- **Demo crítica**: 9 pasos reproducibles, de condiciones favorables a críticas, para mostrar cómo cambian las reglas activadas.
- Ejemplo numérico: velocidad 125 km/h, distancia 8 m, vía 88 → se activan reglas de riesgo «muy alto» con α cercano a 1 y el centroide queda en la zona alta.

## Pruebas

`npm test` cubre: pertenencia en límites e interior, grados en [0,1], entradas inválidas, salida finita en [0,100] sobre una rejilla del espacio de entradas, orden favorable < intermedio < crítico, monotonía al empeorar cada variable, activación de reglas, completitud de la base y generación de datos en rango.

## Limitaciones y alcance educativo

- Los datos son **simulados**; no provienen de sensores ni de un vehículo.
- Los parámetros de los conjuntos y las reglas son didácticos, no están calibrados con datos reales ni normas de seguridad vial.
- No debe usarse para tomar decisiones de conducción.
- La base de reglas es lineal en la suma de niveles; un experto real podría ajustar pesos o conjuntos por zona.
