function Banner() {
  return (
    <div className="h-[33vh] sm:h-[60vh] mb-6 flex items-center justify-center flex-col animated-gradient">
      <h1
        className="relative font-bold leading-[1] max-w-[60rem] font-plaster
        text-[4.5rem] md:text-[7rem] lg:text-[12rem] lg:-mt-5 uppercase
        bg-clip-text text-transparent bg-no-repeat bg-center
        bg-[length:200%_200%] md:bg-[length:170%_170%]
        filter contrast-125 brightness-90"
        style={{
          // 2 backgrounds on the SAME element:
          // 1) asphalt-tinted gradient (adds darkness/definition)
          // 2) your diamonds.png texture
          backgroundImage: `linear-gradient(to bottom,
              color-mix(in srgb, var(--hc-asphalt) 55%, transparent),
              color-mix(in srgb, var(--hc-asphalt) 15%, transparent)
             ),
             url('/lines.png')`,
          backgroundBlendMode: 'multiply',
        }}>
        <p>Happy</p>
        <p>Crafts</p>

        <p className="absolute right-0 -bottom-4 text-[var(--hc-asphalt)] font-medium text-[1rem] lg:text-[2rem] capitalize font-molle">
          By Leslie
        </p>
      </h1>
    </div>
  );
}
export default Banner;
