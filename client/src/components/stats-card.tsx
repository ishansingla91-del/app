interface StatsCardProps {
  title: string;
  value: string | number;
}

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="p-6 rounded-xl border bg-white shadow">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
