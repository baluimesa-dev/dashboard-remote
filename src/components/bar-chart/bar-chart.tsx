import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useSpring, animated } from '@react-spring/web';

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
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const containerWidth = 800;
  const containerHeight = 400;

  const width = Math.max(data.length * 40, containerWidth - margin.left - margin.right);
  const height = containerHeight - margin.top - margin.bottom;

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

  const xAxisRef = useRef<SVGGElement | null>(null);
  const yAxisRef = useRef<SVGGElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(x);
      d3.select(xAxisRef.current).call(xAxis);
    }
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(y);
      d3.select(yAxisRef.current).call(yAxis);
    }
  }, [x, y]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflowX: 'auto' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}
        style={{ width: `${width + margin.left + margin.right}px`, height: `${containerHeight}px` }}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* X Axis */}
          <g ref={xAxisRef} transform={`translate(0, ${height})`} />

          {/* Y Axis */}
          <g ref={yAxisRef} />

          {/* Bars */}
          {data.map((d, i) => {
            const heightSpring = useSpring({
              from: { height: 0 },
              to: { height: height - y(d.paymentInformation.totalOrderCost) },
              config: { tension: 280, friction: 60 },
            });

            return (
              <animated.rect
                key={i}
                x={x(d.orderInformation.orderNumber)}
                y={heightSpring.height.to((hs) => height - hs)}
                width={x.bandwidth()}
                style={heightSpring}
                fill="steelblue"
                onMouseOver={(event) => {
                  if (svgRef.current) {
                    const svgRect = svgRef.current.getBoundingClientRect();
                    setTooltip({
                      visible: true,
                      x: event.clientX - svgRect.left + 10,
                      y: event.clientY - svgRect.top - 28,
                      content: `$${d.paymentInformation.totalOrderCost.toFixed(2)}`,
                    });
                  }
                }}
                onMouseOut={() => {
                  setTooltip({ ...tooltip, visible: false });
                }}
              />
            );
          })}
          <text
            textAnchor="middle"
            x={width / 2}
            y={height + margin.bottom}
          >
            Order Number
          </text>
          <text
            textAnchor="middle"
            x={-height / 2}
            y={-margin.left + 20}
            transform="rotate(-90)"
          >
            Total Order Cost
          </text>
        </g>
      </svg>

      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            background: 'lightsteelblue',
            padding: '5px',
            borderRadius: '5px',
            pointerEvents: 'none',
            textAlign: 'center',
            fontSize: '12px',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default BarChart;
