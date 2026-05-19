const row1Items = ['Zukunft mit der Sonne', 'Kraft der Solar-Innovation', 'Erneuerbare Energie', 'Kraft der Solar-Innovation'];
const row2Items = ['Erneuerbare Revolution', 'Saubere Energie', 'Solar-Lösungen', 'Sonnenenergie', 'Strahlende Zukunft'];

export default function Marquee() {
  return (
    <section className="overflow-hidden">
      {/* Row 1 - scrolls left, light gray bg */}
      <div className="bg-[#F5F5F5] py-6 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee-left flex items-center">
            {[...row1Items, ...row1Items, ...row1Items, ...row1Items].map((text, i) => (
              <span key={i} className="text-xl md:text-2xl font-medium text-black flex items-center mx-4">
                {text}
                <span className="ml-4 text-black">★</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 - scrolls right, black bg */}
      <div className="bg-black py-6 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee-right flex items-center">
            {[...row2Items, ...row2Items, ...row2Items, ...row2Items].map((text, i) => (
              <span key={i} className="text-xl md:text-2xl font-medium text-white flex items-center mx-4">
                {text}
                <span className="ml-4 text-white">★</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
