import { CountByDate } from "./area-chart.types";

export const parseData = <T extends { orderInformation: { orderDate?: string } }>(items: T[]): CountByDate[] => {
    const dateCountMap = items.reduce<Record<string, number>>((acc, item) => {
        const date = item.orderInformation.orderDate;
        if (!date) return acc;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    return Object.keys(dateCountMap).map(date => ({
        date: new Date(date),
        count: dateCountMap[date],
    }));
};
