import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DOSHA_COLOR, DOSHA_NAME } from "../data/content";
import { roundPercentages, type DoshaValues } from "../lib/scoring";
import { DOSHAS } from "../schema/questions.schema";

const AXIS = { fontSize: 14, fill: "#44403c" };

/** Horizontales Balkendiagramm der drei Anteile, direkt beschriftet. */
export function DoshaChart({ percentages, title }: { percentages: DoshaValues; title: string }) {
  const rounded = roundPercentages(percentages);
  const data = DOSHAS.map((d) => ({ dosha: d, name: DOSHA_NAME[d], value: rounded[d] }));
  return (
    <figure className="space-y-2">
      <figcaption className="sr-only">{title}</figcaption>
      <div aria-hidden="true" className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} stroke="#e7e5e4" />
            <XAxis type="number" domain={[0, 100]} tick={AXIS} tickFormatter={(v) => `${v} %`} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={AXIS} width={56} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              formatter={(v: number) => [`${v} %`, "Anteil"]}
              contentStyle={{ borderRadius: 8, borderColor: "#d6d3d1" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.dosha} fill={DOSHA_COLOR[d.dosha]} />
              ))}
              <LabelList dataKey="value" position="right" formatter={(v: number) => `${v} %`} fill="#1c1917" fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Dosha</th>
            <th scope="col">Anteil</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.dosha}>
              <th scope="row">{d.name}</th>
              <td>{d.value} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export const SERIES = { prakriti: "#5b4fa8", vikriti: "#c2620c" };

/** Gruppierte Balken: Prakriti und Vikriti je Dosha. */
export function CompareChart({ prakriti, vikriti }: { prakriti: DoshaValues; vikriti: DoshaValues }) {
  const p = roundPercentages(prakriti);
  const v = roundPercentages(vikriti);
  const data = DOSHAS.map((d) => ({ name: DOSHA_NAME[d], Prakriti: p[d], Vikriti: v[d] }));
  return (
    <figure>
      <figcaption className="sr-only">Vergleich der Anteile von Prakriti und Vikriti</figcaption>
      <div aria-hidden="true" className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, bottom: 4, left: -16 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="#e7e5e4" />
            <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={AXIS} tickFormatter={(x) => `${x}`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(x: number) => `${x} %`} contentStyle={{ borderRadius: 8, borderColor: "#d6d3d1" }} />
            <Legend wrapperStyle={{ fontSize: 14 }} formatter={(value: string) => <span style={{ color: "#1c1917" }}>{value}</span>} />
            <Bar dataKey="Prakriti" fill={SERIES.prakriti} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="Prakriti" position="top" fontSize={12} fill="#1c1917" formatter={(x: number) => `${x}`} />
            </Bar>
            <Bar dataKey="Vikriti" fill={SERIES.vikriti} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="Vikriti" position="top" fontSize={12} fill="#1c1917" formatter={(x: number) => `${x}`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Vergleich Prakriti und Vikriti in Prozent</caption>
        <thead>
          <tr>
            <th scope="col">Dosha</th>
            <th scope="col">Prakriti</th>
            <th scope="col">Vikriti</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <th scope="row">{d.name}</th>
              <td>{d.Prakriti} %</td>
              <td>{d.Vikriti} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
