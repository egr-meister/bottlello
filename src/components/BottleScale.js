// The signature Bottlello visual: one large bottle with measurement marks.
// The fill shows daily goal progress (capped at 100% visually);
// the scale marks show 1/4, 1/2, 3/4, Full amounts of the active bottle.

import React from 'react';
import Svg, { Path, Rect, Line, Text as SvgText, ClipPath, Defs, Circle } from 'react-native-svg';
import { colors } from '../theme';
import { FRACTION_ORDER, FRACTIONS, fractionAmount } from '../utils';

const VIEW_W = 260;
const VIEW_H = 390;

// Bottle geometry inside the viewBox.
const BODY_LEFT = 58;
const BODY_RIGHT = 162;
const WATER_TOP = 104; // y of the "Full" mark
const WATER_BOTTOM = 356; // y of the bottle inner bottom

const BOTTLE_PATH =
  'M92 14 L128 14 L128 44 ' +
  'C128 62 162 72 162 98 ' +
  'L162 336 Q162 362 136 362 ' +
  'L84 362 Q58 362 58 336 ' +
  'L58 98 C58 72 92 62 92 44 Z';

export default function BottleScale({
  volumeMl,
  totalMl,
  goalMl,
  width,
  goalReached,
}) {
  const volume = Math.max(1, Number(volumeMl) || 500);
  const total = Math.max(0, Number(totalMl) || 0);
  const goal = Math.max(1, Number(goalMl) || 2000);
  const fillFraction = Math.min(1, total / goal);
  const span = WATER_BOTTOM - WATER_TOP;
  const waterY = WATER_BOTTOM - span * fillFraction;
  const done = goalReached === true || total >= goal;
  const fillColor = done ? colors.fillDone : colors.fill;
  const w = Number(width) || 230;
  const h = Math.round((w / VIEW_W) * VIEW_H);

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      <Defs>
        <ClipPath id="bottleClip">
          <Path d={BOTTLE_PATH} />
        </ClipPath>
      </Defs>

      {/* Water fill, clipped to the bottle shape */}
      <Rect
        x={BODY_LEFT}
        y={waterY}
        width={BODY_RIGHT - BODY_LEFT}
        height={WATER_BOTTOM - waterY + 8}
        fill={fillColor}
        opacity={0.85}
        clipPath="url(#bottleClip)"
      />
      {fillFraction > 0.01 ? (
        <Rect
          x={BODY_LEFT}
          y={waterY}
          width={BODY_RIGHT - BODY_LEFT}
          height={5}
          fill={colors.fillDeep}
          opacity={0.5}
          clipPath="url(#bottleClip)"
        />
      ) : null}

      {/* Bottle cap */}
      <Rect x={88} y={4} width={44} height={16} rx={5} fill={colors.teal} />

      {/* Bottle outline */}
      <Path d={BOTTLE_PATH} fill="none" stroke={colors.text} strokeWidth={3.5} />

      {/* Scale marks: 1/4, 1/2, 3/4, Full of the active bottle */}
      {FRACTION_ORDER.map((key) => {
        const value = FRACTIONS[key]?.value ?? 1;
        const y = WATER_BOTTOM - span * value;
        const amount = fractionAmount(volume, key);
        return (
          <React.Fragment key={key}>
            <Line
              x1={BODY_LEFT + 4}
              y1={y}
              x2={BODY_LEFT + 34}
              y2={y}
              stroke={colors.teal}
              strokeWidth={2.5}
            />
            <Line
              x1={BODY_RIGHT - 12}
              y1={y}
              x2={BODY_RIGHT - 4}
              y2={y}
              stroke={colors.teal}
              strokeWidth={2}
            />
            <SvgText
              x={BODY_RIGHT + 10}
              y={y + 4}
              fontSize={13}
              fontWeight="bold"
              fill={colors.text}
            >
              {FRACTIONS[key].label}
            </SvgText>
            <SvgText
              x={BODY_RIGHT + 44}
              y={y + 4}
              fontSize={11}
              fill={colors.textSoft}
            >
              {amount + ' ml'}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Small base mark */}
      <Line
        x1={BODY_LEFT + 4}
        y1={WATER_BOTTOM}
        x2={BODY_LEFT + 20}
        y2={WATER_BOTTOM}
        stroke={colors.tealSoft}
        strokeWidth={2}
      />

      {/* Goal reached badge */}
      {done ? (
        <>
          <Circle cx={110} cy={230} r={26} fill={colors.white} opacity={0.9} />
          <SvgText
            x={110}
            y={238}
            fontSize={24}
            fontWeight="bold"
            fill={colors.fillDone}
            textAnchor="middle"
          >
            {'✓'}
          </SvgText>
        </>
      ) : null}
    </Svg>
  );
}
