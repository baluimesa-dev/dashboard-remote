import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldMapData from './world-110m.json';
import React, { useRef, useEffect } from 'react';
import { Topology, GeometryObject } from 'topojson-specification';

type Order = {
  buyerInformation: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
};

type MapChartProps = {
  data: Order[];
};

const MapChart: React.FC<MapChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      const container = svgElement.parentElement;
      const width = container?.clientWidth || 960;
      const height = container?.clientHeight || 500;

      const projection = d3.geoMercator()
        .scale(width / 6.5) 
        .translate([width / 2, height / 1.5]);

      const path = d3.geoPath().projection(projection);

      const svg = d3.select(svgElement)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      svg.selectAll('*').remove();

      const topology = worldMapData as unknown as Topology;

      svg.append('path')
        .datum(topojson.feature(topology, worldMapData.objects.countries as GeometryObject))
        .attr('d', path)
        .attr('class', 'land')
        .attr('fill', '#ccc')
        .attr('stroke', '#333');

      svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => projection([d.buyerInformation?.coordinates?.longitude, d.buyerInformation?.coordinates?.latitude])?.[0]!)
        .attr('cy', d => projection([d.buyerInformation.coordinates.longitude, d.buyerInformation.coordinates.latitude])?.[1]!)
        .attr('r', 4)
        .attr('fill', 'red')
        .attr('opacity', 0.7);
    };

    handleResize(); 
    window.addEventListener('resize', handleResize); 

    return () => window.removeEventListener('resize', handleResize); 
  }, [data]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>;
};

export default MapChart;
