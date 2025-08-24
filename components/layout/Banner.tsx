function Banner() {
  return (
    <div className="h-[50vh] sm:h-[70vh] mb-6 flex items-center justify-center flex-col animated-gradient">
      <h1 className="font-bold text-[var(--hc-offwhite)] leading-[1.2] max-w-[60rem] relative">
        <p className="font-mr_bedfort text-[4rem] md:text-[6rem] lg:text-[8rem] text-shadow-sm text-shadow-black/50">
          Happy
        </p>

        <p className="font-plaster text-[4.5rem] md:text-[7rem] lg:text-[12rem] lg:-mt-5 uppercase text-shadow-sm text-shadow-black/50">
          Crafts
        </p>
        <p className="absolute right-0 -bottom-4 text-[var(--hc-asphalt)] text-[1.5rem] lg:text-[3rem]">
          By Leslie{' '}
        </p>
      </h1>
    </div>
  );
}
export default Banner;
