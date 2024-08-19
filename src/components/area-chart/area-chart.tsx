import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { parseData } from './area-chart.utils';
import { AreaChartProps, DataPoint, Order } from './area-chart.types';
  


const AreaChart: React.FC<AreaChartProps<Object>> = ({ data:rawData }) => {
  const data = parseData([...rawData] as Order<Object>[]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const width = svgRef.current.parentElement?.clientWidth || 800;
        const height = (width / 2); 
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

   const parsedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const { width, height } = dimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.count) as number])
      .nice()
      .range([innerHeight, 0]);

    const areaGenerator = d3.area<DataPoint>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(parsedData)
      .attr('fill', 'steelblue')
      .attr('d', areaGenerator);

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));
  }, [data, dimensions]);

  return (
    <svg ref={svgRef} width="100%" height="100%"></svg>
  );
};

export default AreaChart;
