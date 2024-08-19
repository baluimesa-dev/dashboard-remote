import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type Order = {
  orderInformation: {
    orderNumber: string;
    orderDate: string;
  };
  paymentInformation: {
    totalOrderCost: number;
  };
};

type BarChartProps = {
  data: Order[];
};

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Remove any existing SVG elements
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.orderInformation.orderNumber))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.paymentInformation.totalOrderCost) as number])
      .nice()
      .range([height, 0]);

    // Create a tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('width', '60px')
      .style('height', '28px')
      .style('padding', '2px')
      .style('font', '12px sans-serif')
      .style('background', 'lightsteelblue')
      .style('border', '0px')
      .style('border-radius', '8px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Add the bars
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.orderInformation.orderNumber)!)
      .attr('y', (d) => y(d.paymentInformation.totalOrderCost))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.paymentInformation.totalOrderCost))
      .attr('fill', 'steelblue')
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(`$${d.paymentInformation.totalOrderCost.toFixed(2)}`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g').call(d3.axisLeft(y));

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2 + margin.left)
      .attr('y', height + margin.top + 20)
      .text('Order Number');

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .attr('transform', 'rotate(-90)')
      .text('Total Order Cost');
  }, [data]);

  return <svg ref={chartRef} width="100%" height="100%"></svg>;
};

export default BarChart;
