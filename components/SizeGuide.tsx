const nudeProjectRows = [
  { size: "S", chest: "52", shoulder: "50", length: "69" },
  { size: "M", chest: "54", shoulder: "52", length: "71" },
  { size: "L", chest: "56", shoulder: "54", length: "73" },
  { size: "XL", chest: "59", shoulder: "57", length: "75" },
  { size: "XXL", chest: "62", shoulder: "60", length: "77" }
];

const scuffersRows = [
  { size: "S", chest: "49", length: "64", sleeve: "19", height: "160-170 cm", weight: "50-60 kg" },
  { size: "M", chest: "51", length: "66", sleeve: "20", height: "170-175 cm", weight: "60-70 kg" },
  { size: "L", chest: "55", length: "68", sleeve: "21", height: "175-180 cm", weight: "70-80 kg" },
  { size: "XL", chest: "57", length: "70", sleeve: "22", height: "180-185 cm", weight: "80-90 kg" }
];

export function SizeGuide({ brand }: { brand?: string | null }) {
  const isScuffers = brand?.toLowerCase().includes("scuffers");
  const isNude = brand?.toLowerCase().includes("nude");

  if (!isScuffers && !isNude) {
    return (
      <section className="mt-8 rounded-2xl border border-wine/20 bg-cream p-5">
        <p className="text-xs uppercase text-wine">Guia de tallas</p>
        <h2 className="mt-1 font-editorial text-3xl text-deepwine">Medidas por marca</h2>
        <p className="mt-4 text-sm leading-6 text-ink/70">Guia pendiente para esta marca. Escríbenos si necesitas ayuda con el fit.</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-wine/20 bg-cream p-5">
      <p className="text-xs uppercase text-wine">Guia de tallas</p>
      <h2 className="mt-1 font-editorial text-3xl text-deepwine">{isScuffers ? "Scuffers" : "Nude Project"} · Medidas en cm</h2>
      <p className="mt-3 text-sm text-ink/70">Puede existir una variacion de 1-3 cm.</p>

      {isScuffers ? (
        <div className="mt-5 grid grid-cols-6 overflow-hidden rounded border border-wine/15 text-center text-[11px] md:text-xs">
          {["Talla", "Pecho", "Largo", "Manga", "Estatura", "Peso"].map((head) => (
            <div key={head} className="bg-warmwhite p-2 font-bold uppercase text-wine md:p-3">{head}</div>
          ))}
          {scuffersRows.flatMap((row) => [
            <div key={`${row.size}-size`} className="border-t border-wine/15 p-2 font-bold md:p-3">{row.size}</div>,
            <div key={`${row.size}-chest`} className="border-t border-wine/15 p-2 md:p-3">{row.chest}</div>,
            <div key={`${row.size}-length`} className="border-t border-wine/15 p-2 md:p-3">{row.length}</div>,
            <div key={`${row.size}-sleeve`} className="border-t border-wine/15 p-2 md:p-3">{row.sleeve}</div>,
            <div key={`${row.size}-height`} className="border-t border-wine/15 p-2 md:p-3">{row.height}</div>,
            <div key={`${row.size}-weight`} className="border-t border-wine/15 p-2 md:p-3">{row.weight}</div>
          ])}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-4 overflow-hidden rounded border border-wine/15 text-center text-xs">
          {["Talla", "Pecho", "Hombros", "Largo"].map((head) => (
            <div key={head} className="bg-warmwhite p-3 font-bold uppercase text-wine">{head}</div>
          ))}
          {nudeProjectRows.flatMap((row) => [
            <div key={`${row.size}-size`} className="border-t border-wine/15 p-3 font-bold">{row.size}</div>,
            <div key={`${row.size}-chest`} className="border-t border-wine/15 p-3">{row.chest}</div>,
            <div key={`${row.size}-shoulder`} className="border-t border-wine/15 p-3">{row.shoulder}</div>,
            <div key={`${row.size}-length`} className="border-t border-wine/15 p-3">{row.length}</div>
          ])}
        </div>
      )}
    </section>
  );
}
