export default function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="inline-flex rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium capitalize text-black/65">
      {value.replaceAll("_", " ")}
    </span>
  );
}