import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useSpring, animated } from '@react-spring/web';

type Approval = {
  buyerSignature: string;
  buyerApprovalDate: string;
  supplierSignature: string;
  supplierApprovalDate: string;
};

type Order = {
  approval: Approval;
};

type GaugeProps = {
  data: Order[];
};

const calculateSameDayApprovalPercentage = (data: Order[]) => {
  const sameDayCount = data.filter(
    (order) =>
      order.approval.buyerApprovalDate === order.approval.supplierApprovalDate
  ).length;
  return (sameDayCount / data.length) * 100;
};

const Gauge: React.FC<GaugeProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const percentage = useMemo(() => calculateSameDayApprovalPercentage(data), [data]);

  const config = {
    size: 220,
    arcThickness: 20,
    minValue: 0,
    maxValue: 100,
    startAngle: -Math.PI / 2, // Leftmost point (-90 degrees)
    endAngle: Math.PI / 2, // Rightmost point (90 degrees)
  };

  const { size, arcThickness, minValue, maxValue, startAngle, endAngle } = config;
  const radius = size / 2;
  const pointerLength = radius - arcThickness / 2;

  const arc = d3.arc()
    .innerRadius(radius - arcThickness)
    .outerRadius(radius)
    .startAngle(startAngle)
    .endAngle(endAngle);

  const angleScale = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([startAngle, endAngle]);

  const springProps = useSpring({
    from: { angle: startAngle },
    to: { angle: angleScale(percentage) },
    config: { tension: 280, friction: 60 },
  });

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);

      // Clear existing elements
      svg.select('.arc-background').remove();
      svg.select('.center-circle').remove();
      svg.select('.tick-labels').remove();

      // Draw the background arc
      svg.append('path')
        .attr('class', 'arc-background')
        .attr('d', arc as any)
        .attr('fill', '#ddd')
        .attr('transform', `translate(${size / 2},${size / 2})`);

      // Draw the center circle for the pointer base
      svg.append('circle')
        .attr('class', 'center-circle')
        .attr('cx', size / 2)
        .attr('cy', size / 2)
        .attr('r', 6)
        .attr('fill', 'black');
        

      // Draw the tick marks and labels using the same angleScale logic
      const ticks = [0, 25, 50, 75, 100];
      const tickData = ticks.map((tick) => ({
        value: tick,
        angle: angleScale(tick + 150),
      }));

      const tickGroup = svg.append('g')
        .attr('class', 'tick-labels')
        .attr('transform', `translate(${size / 2},${size / 2})`);

      tickGroup.selectAll('line')
        .data(tickData)
        .enter()
        .append('line')
        .attr('x1', (d) => (radius - arcThickness - 10) * Math.cos(d.angle))
        .attr('y1', (d) => (radius - arcThickness - 10) * Math.sin(d.angle))
        .attr('x2', (d) => radius * Math.cos(d.angle))
        .attr('y2', (d) => radius * Math.sin(d.angle))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      tickGroup.selectAll('text')
        .data(tickData)
        .enter()
        .append('text')
        .attr('x', (d) => (radius - arcThickness - 25) * Math.cos(d.angle))
        .attr('y', (d) => (radius - arcThickness - 25) * Math.sin(d.angle))
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text((d) => `${d.value}`);
    }
  }, [arc, size, angleScale]);

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size / 2 + 50}px` }}>
      <svg ref={svgRef} width={size} height={size / 2 + 50}>
        {/* Animated Pointer */}
        <animated.g
          transform={springProps.angle.to((angle) => `translate(${size / 2},${size / 2}) rotate(${(angle * 180) / Math.PI})`)}
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={-pointerLength}
            stroke="black"
            strokeWidth="4"
          />
        </animated.g>

        {/* Percentage Text */}
        <text
          x={size / 2}
          y={size / 2 + arcThickness + 30} // Adjusted to ensure it shows below the arc
          textAnchor="middle"
          fontSize="20"
          fill="black"
        >
          {`${percentage.toFixed(0)}%`}
        </text>
      </svg>
    </div>
  );
};

export default Gauge;
