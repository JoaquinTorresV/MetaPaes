-- ============================================================
-- Migration 003: Seed de learning_objectives
-- Extraídos directamente de los temarios DEMRE 2027
-- Ejecutar DESPUÉS de 001 y 002
-- ============================================================

INSERT INTO learning_objectives (subject, axis, objective_code, description, weight_in_paes, prerequisite_ids) VALUES

-- ══════════════════════════════════════════════════════════════
-- COMPETENCIA LECTORA
-- ══════════════════════════════════════════════════════════════

('competencia_lectora','localizar','CL-LOC-01','Extraer información explícita del texto (literal o casi literal)',0.120,'{}'),
('competencia_lectora','localizar','CL-LOC-02','Identificar información explícita formulada a través de sinónimos y paráfrasis',0.080,'{}'),
('competencia_lectora','interpretar','CL-INT-01','Establecer relaciones entre partes del texto (problema/solución, causa/consecuencia, categoría/ejemplo)',0.100,'{}'),
('competencia_lectora','interpretar','CL-INT-02','Elaborar inferencias sobre el significado local y global a partir de marcas textuales',0.100,'{}'),
('competencia_lectora','interpretar','CL-INT-03','Determinar el significado de una parte, párrafo, sección o del texto completo',0.080,'{}'),
('competencia_lectora','interpretar','CL-INT-04','Sintetizar las ideas centrales de una sección o del texto; identificar jerarquía de ideas',0.080,'{}'),
('competencia_lectora','interpretar','CL-INT-05','Reconocer la función de un elemento textual (ejemplos, citas, figuras retóricas)',0.070,'{}'),
('competencia_lectora','evaluar_no_literarios','CL-EVA-NL-01','Identificar tesis, argumentos y organización de las ideas en textos argumentativos',0.090,'{}'),
('competencia_lectora','evaluar_no_literarios','CL-EVA-NL-02','Analizar recursos lingüísticos y retóricos (figuras literarias, modalizaciones, intertextualidad)',0.080,'{}'),
('competencia_lectora','evaluar_no_literarios','CL-EVA-NL-03','Evaluar la suficiencia, consistencia y calidad de la información; identificar fallas argumentativas',0.070,'{}'),
('competencia_lectora','evaluar_literarios','CL-EVA-LIT-01','Analizar evolución, características y relaciones de personajes en narraciones',0.080,'{}'),
('competencia_lectora','evaluar_literarios','CL-EVA-LIT-02','Reconocer recursos literarios (narrador, saltos temporales, historias paralelas, tópicos, símbolos)',0.070,'{}'),

-- ══════════════════════════════════════════════════════════════
-- MATEMÁTICA M1 (prueba obligatoria)
-- ══════════════════════════════════════════════════════════════

('m1','numeros','M1-NUM-01','Operaciones y orden en el conjunto de los números enteros y racionales',0.080,'{}'),
('m1','numeros','M1-NUM-02','Porcentaje: concepto, cálculo y problemas en contexto',0.070,'{}'),
('m1','numeros','M1-NUM-03','Potencias de base racional y exponente racional; raíces enésimas en los números reales',0.070,'{}'),
('m1','algebra_funciones','M1-ALG-01','Productos notables, factorizaciones y operatoria con expresiones algebraicas',0.070,'{}'),
('m1','algebra_funciones','M1-ALG-02','Proporcionalidad directa e inversa con diferentes representaciones',0.060,'{}'),
('m1','algebra_funciones','M1-ALG-03','Resolución de ecuaciones e inecuaciones lineales de primer grado',0.070,'{}'),
('m1','algebra_funciones','M1-ALG-04','Sistemas de ecuaciones lineales 2x2: resolución y problemas en contexto',0.060,'{}'),
('m1','algebra_funciones','M1-ALG-05','Función lineal y afín: concepto, tablas, gráficos y problemas',0.070,'{}'),
('m1','algebra_funciones','M1-ALG-06','Función cuadrática: ecuaciones de segundo grado, gráfico, vértice, ceros e intersecciones',0.080,'{}'),
('m1','geometria','M1-GEO-01','Teorema de Pitágoras y sus aplicaciones en contexto',0.060,'{}'),
('m1','geometria','M1-GEO-02','Perímetro y áreas de triángulos, paralelogramos, trapecios y círculos',0.070,'{}'),
('m1','geometria','M1-GEO-03','Área de superficie y volumen de paralelepípedos, cubos y cilindros',0.060,'{}'),
('m1','geometria','M1-GEO-04','Transformaciones isométricas: rotación, traslación y reflexión en plano cartesiano',0.050,'{}'),
('m1','geometria','M1-GEO-05','Semejanza y proporcionalidad de figuras; modelos a escala',0.050,'{}'),
('m1','probabilidad_estadistica','M1-EST-01','Tablas de frecuencia y gráficos estadísticos; promedio de un conjunto de datos',0.070,'{}'),
('m1','probabilidad_estadistica','M1-EST-02','Cuartiles, percentiles y diagrama de cajón para distribución de datos',0.060,'{}'),
('m1','probabilidad_estadistica','M1-EST-03','Probabilidad de un evento; regla aditiva y multiplicativa de probabilidades',0.070,'{}'),

-- ══════════════════════════════════════════════════════════════
-- MATEMÁTICA M2 (incluye todo M1 + los siguientes)
-- ══════════════════════════════════════════════════════════════

('m2','numeros','M2-NUM-01','Operaciones en el conjunto de los números reales y problemas en contexto',0.070,'{}'),
('m2','numeros','M2-NUM-02','Matemática financiera: AFP, jubilación, créditos hipotecarios y crédito de consumo',0.070,'{}'),
('m2','numeros','M2-NUM-03','Logaritmos: relación con potencias y raíces, propiedades, problemas en contexto',0.080,'{}'),
('m2','algebra_funciones','M2-ALG-01','Sistemas de ecuaciones lineales 2x2: solución única, infinitas soluciones o sin solución',0.060,'{}'),
('m2','algebra_funciones','M2-ALG-02','Función potencia, exponencial y logarítmica: gráfico y problemas en contexto',0.090,'{}'),
('m2','algebra_funciones','M2-ALG-03','Funciones trigonométricas seno y coseno: gráfico y problemas en contexto',0.080,'{}'),
('m2','geometria','M2-GEO-01','Homotecia de figuras planas y problemas en contexto',0.050,'{}'),
('m2','geometria','M2-GEO-02','Razones trigonométricas (seno, coseno, tangente) en triángulos rectángulos',0.080,'{}'),
('m2','geometria','M2-GEO-03','Relaciones métricas en la circunferencia: ángulos, arcos, cuerdas y secantes',0.070,'{}'),
('m2','geometria','M2-GEO-04','Esferas: área de superficie y volumen en problemas en contexto',0.050,'{}'),
('m2','geometria','M2-GEO-05','Rectas en el plano y posiciones relativas',0.050,'{}'),
('m2','probabilidad_estadistica','M2-EST-01','Medidas de dispersión de uno o más grupos de datos y problemas',0.070,'{}'),
('m2','probabilidad_estadistica','M2-EST-02','Probabilidad condicional y sus propiedades en problemas en contexto',0.070,'{}'),
('m2','probabilidad_estadistica','M2-EST-03','Permutación y combinatoria: concepto y problemas en contexto',0.070,'{}'),
('m2','probabilidad_estadistica','M2-EST-04','Modelos probabilísticos: distribución binomial y distribución normal',0.070,'{}'),

-- ══════════════════════════════════════════════════════════════
-- HISTORIA Y CIENCIAS SOCIALES
-- ══════════════════════════════════════════════════════════════

('historia','siglo_xix','HIS-XIX-01','Ideas republicanas y liberales; surgimiento del Estado-nación en América y Europa (s. XIX)',0.090,'{}'),
('historia','siglo_xix','HIS-XIX-02','Formación de la República en Chile; inserción económica mundial; transformaciones sociales (s. XIX)',0.090,'{}'),
('historia','primera_mitad_xx','HIS-XX1-01','Totalitarismos europeos, populismo latinoamericano e inicios del Estado de bienestar (primera mitad s. XX)',0.090,'{}'),
('historia','segunda_mitad_xx','HIS-XX2-01','Nuevo orden mundial post-WWII; descolonización; ONU y DDHH; Guerra Fría y sus manifestaciones',0.090,'{}'),
('historia','segunda_mitad_xx','HIS-XX2-02','América Latina: revoluciones, dictaduras militares y violación de DDHH en la segunda mitad del s. XX',0.080,'{}'),
('historia','chile_contemporaneo','HIS-CHI-01','Sociedad chilena a mediados del s. XX: pobreza, migración campo-ciudad, democratización',0.070,'{}'),
('historia','chile_contemporaneo','HIS-CHI-02','Dictadura Militar 1973-1990: golpe de estado, modelo neoliberal, violaciones DDHH, transición a democracia',0.090,'{}'),
('historia','ciudadania','HIS-CIU-01','Democracia: fundamentos, atributos y dimensiones; institucionalidad democrática en Chile',0.080,'{}'),
('historia','ciudadania','HIS-CIU-02','Medios de comunicación, nuevas tecnologías y democracia; sistema judicial chileno',0.070,'{}'),
('historia','sistema_economico','HIS-ECO-01','Funcionamiento del mercado; relaciones Estado-mercado; modelos de desarrollo',0.080,'{}'),
('historia','sistema_economico','HIS-ECO-02','Derechos laborales en Chile: evolución, movimientos sociales y tendencias globales',0.070,'{}'),

-- ══════════════════════════════════════════════════════════════
-- BIOLOGÍA
-- ══════════════════════════════════════════════════════════════

('biologia','organizacion_celular','BIO-CEL-01','Estructura y función de organelos celulares en procariontes y eucariontes (membrana, núcleo, mitocondria, cloroplasto, ribosomas, Golgi, etc.)',0.220,'{}'),
('biologia','organizacion_celular','BIO-CEL-02','Relación entre estructuras y función celular en tipos específicos: enterocito, neurona, célula muscular, secretora pancreática',0.100,'{}'),
('biologia','procesos_biologicos','BIO-PRO-01','Sistema nervioso: estructura neuronal, impulso nervioso, sinapsis química, arco reflejo, efectos de sustancias',0.150,'{}'),
('biologia','procesos_biologicos','BIO-PRO-02','Reproducción humana: gametos, fecundación, ciclo ovárico y uterino; métodos de control de natalidad; ITS',0.130,'{}'),
('biologia','herencia_evolucion','BIO-HER-01','Ciclo celular: interfase, mitosis, puntos de control; importancia en crecimiento y cáncer',0.150,'{}'),
('biologia','herencia_evolucion','BIO-HER-02','Meiosis I y II y su contribución a la variabilidad genética; manipulación genética y aplicaciones',0.120,'{}'),
('biologia','herencia_evolucion','BIO-HER-03','Evolución: evidencias, aportes de Lamarck, Darwin y Wallace; selección natural',0.130,'{}'),

-- ══════════════════════════════════════════════════════════════
-- FÍSICA
-- ══════════════════════════════════════════════════════════════

('fisica','ondas','FIS-OND-01','Ondas electromagnéticas: longitud de onda, frecuencia, período, amplitud; absorción, reflexión, refracción',0.150,'{}'),
('fisica','ondas','FIS-OND-02','Espectro electromagnético, formación de colores; comportamiento de la luz en espejos y lentes; dispositivos tecnológicos',0.120,'{}'),
('fisica','mecanica','FIS-MEC-01','Cinemática: posición, desplazamiento, velocidad, aceleración; MRU y MRUA con ecuaciones e itinerarios',0.150,'{}'),
('fisica','mecanica','FIS-MEC-02','Leyes de Newton; fuerzas: peso, elástica, tensión, normal, roce; diagramas de cuerpo libre',0.150,'{}'),
('fisica','mecanica','FIS-MEC-03','Modelos cosmológicos geocéntrico y heliocéntrico; aportes de Galileo y Kepler; teorías del origen del universo',0.080,'{}'),
('fisica','energia_tierra','FIS-TIE-01','Tectónica de placas: deriva continental, sismos, volcanismo, relieve; estructura interna de la Tierra',0.120,'{}'),
('fisica','electricidad','FIS-ELE-01','Ley de Ohm en circuitos serie, paralelo y mixto; potencia y energía eléctrica; consumo y eficiencia energética',0.130,'{}'),

-- ══════════════════════════════════════════════════════════════
-- QUÍMICA
-- ══════════════════════════════════════════════════════════════

('quimica','estructura_atomica','QUI-ATO-01','Clasificación de la materia (sustancias puras y mezclas); procedimientos de separación; propiedades físicas',0.120,'{}'),
('quimica','estructura_atomica','QUI-ATO-02','Modelos atómicos: Dalton, Thomson, Rutherford, Bohr; electrón, protón, neutrón; número atómico y másico',0.150,'{}'),
('quimica','quimica_organica','QUI-ORG-01','Átomo de carbono: tetravalencia, hibridación, tipos de enlaces; modelos de representación molecular',0.150,'{}'),
('quimica','quimica_organica','QUI-ORG-02','Compuestos orgánicos: hidrocarburos (alifáticos, cíclicos, aromáticos) y grupos funcionales',0.180,'{}'),
('quimica','reacciones_estequiometria','QUI-REA-01','Leyes ponderales; balance de ecuaciones químicas; estequiometría (mol, masa molar); reactivo limitante y en exceso',0.200,'{}'),
('quimica','reacciones_estequiometria','QUI-REA-02','Soluciones químicas: componentes, propiedades, unidades de concentración; diluciones; solubilidad',0.200,'{}')

ON CONFLICT (objective_code) DO NOTHING;
