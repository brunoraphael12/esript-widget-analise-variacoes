import { IClassBreak, AnalysisMethod } from '../../types';

/**
 * Cria um ClassBreaksRenderer para simbolização
 */
export const createClassBreaksRenderer = (
  ClassBreaksRenderer: any,
  SimpleLineSymbol: any,
  classes: IClassBreak[],
  fieldName: string
) => {
  const classBreakInfos = classes.map(classItem => {
    const [r, g, b, a] = classItem.cor;
    return {
      minValue: classItem.min === -999999 ? -Infinity : classItem.min,
      maxValue: classItem.max === 999999 ? Infinity : classItem.max,
      symbol: new SimpleLineSymbol({
        color: [r, g, b, a / 255],
        width: classItem.largura || 2
      }),
      label: classItem.label
    };
  });

  return new ClassBreaksRenderer({
    field: fieldName,
    classBreakInfos: classBreakInfos
  });
};

/**
 * Cria classes padrão para análise sem variação
 */
export const createDefaultClasses = (): IClassBreak[] => {
  return [
    {
      min: 0,
      max: 500,
      cor: [173, 216, 230, 255],
      label: 'Muito Baixo',
      largura: 1
    },
    {
      min: 500,
      max: 1500,
      cor: [144, 238, 144, 255],
      label: 'Baixo',
      largura: 2
    },
    {
      min: 1500,
      max: 3000,
      cor: [255, 255, 0, 255],
      label: 'Médio',
      largura: 3
    },
    {
      min: 3000,
      max: 5000,
      cor: [255, 165, 0, 255],
      label: 'Alto',
      largura: 4
    },
    {
      min: 5000,
      max: 999999,
      cor: [220, 20, 60, 255],
      label: 'Muito Alto',
      largura: 5
    }
  ];
};

/**
 * Cria features fictícias para demonstração
 */
export const createFakeFeatures = (
  Graphic: any,
  Polyline: any,
  classes: IClassBreak[],
  fieldName: string,
  metodo: AnalysisMethod
) => {
  const features: any[] = [];
  const numFeaturesPerClass = metodo === 'com-variacao' ? 20 : 15;

  classes.forEach((classItem, classIndex) => {
    for (let i = 0; i < numFeaturesPerClass; i++) {
      // Gerar valor aleatório dentro do intervalo
      const minVal = classItem.min === -999999 ? -100 : classItem.min;
      const maxVal = classItem.max === 999999 ? 10000 : classItem.max;
      const valor = minVal + Math.random() * (maxVal - minVal);

      // Criar geometria de linha (coordenadas em Lisboa)
      const baseX = -9.1393;
      const baseY = 38.7223;
      const offsetX = (Math.random() - 0.5) * 0.5;
      const offsetY = (Math.random() - 0.5) * 0.5;

      const paths = [
        [
          [baseX + offsetX, baseY + offsetY],
          [baseX + offsetX + (Math.random() - 0.5) * 0.1, baseY + offsetY + (Math.random() - 0.5) * 0.1],
          [baseX + offsetX + (Math.random() - 0.5) * 0.15, baseY + offsetY + (Math.random() - 0.5) * 0.15]
        ]
      ];

      const polyline = new Polyline({
        paths: paths,
        spatialReference: { wkid: 4326 }
      });

      const graphic = new Graphic({
        geometry: polyline,
        attributes: {
          ObjectID: classIndex * numFeaturesPerClass + i + 1,
          Nome: `${classItem.label} - Linha ${i + 1}`,
          [fieldName]: valor
        }
      });

      features.push(graphic);
    }
  });

  return features;
};

/**
 * Determina o nome do campo e as classes baseado no método de análise
 */
export const getAnalysisFieldAndClasses = (
  metodo: AnalysisMethod,
  variationClasses: IClassBreak[]
): { fieldName: string; classes: IClassBreak[] } => {
  if (metodo === 'com-variacao') {
    return {
      fieldName: 'VARIACAO',
      classes: variationClasses
    };
  } else {
    return {
      fieldName: 'VALOR_ANALISE',
      classes: createDefaultClasses()
    };
  }
};
