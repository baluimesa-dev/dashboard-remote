
export interface AreaChartProps<T> {
    data: T[];
};

export type Order<T> = T & {
    orderInformation: {
      orderDate?: string;
    };
  };
  

export type DataPoint = {
    date: Date;
    count: number;
};

export type CountByDate = {
    date: Date;
    count: number;
};
