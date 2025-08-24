'use client'

import { MdOutlineZoomOutMap } from "react-icons/md";
import Image from "next/image";
import { useState } from "react";
import Lightbox from 'yet-another-react-lightbox';
import { Zoom } from 'yet-another-react-lightbox/plugins';
import 'yet-another-react-lightbox/styles.css';


type ZoomableImageProps = {
    src: string;
    sizes?: string;
    width: number;
    height: number;
    alt?: string;
    className?: string;
    imageClassName?: string;
    objectPosition?: string;
}

function ZoomableImage({
    src,
    sizes,
    width,
    height,
    alt = "Zoomable Image",
    className,
    imageClassName,
    objectPosition = "top",
}: ZoomableImageProps) {

    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <div className={`relative group ${className}`}>
                <Image
                    src={src}
                    width={width}
                    height={height}
                    alt={alt}
                    className={`rounded-md object-cover cursor-zoom-in ${imageClassName}`}
                    style={{ objectPosition }}
                    onClick={() => setIsOpen(true)}
                    sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                />

                <button onClick={() => setIsOpen(true)} className="absolute top-4 right-4 z-10 bg-white/30 text-orange-500 p-2 rounded-md sm:opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/50 hover:text-orange-600 cursor-pointer" aria-label="Zoom in"><MdOutlineZoomOutMap className="sm:hidden md:block" size={20} /></button>
            </div>


            <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={[{ src, width, height }]}
              controller={{
                closeOnBackdropClick: true,
                closeOnPullDown: true,
                disableSwipeNavigation: true,
              }} plugins={[Zoom]}
                render={{
                    buttonPrev: () => null,
                    buttonNext: () => null,
                    slide: ({ slide }) => {
                        if ('src' in slide) {
                            return (
                                <div className="w-full h-full flex items-center justify-center bg-black">
                                    <Image src={slide.src} width={slide.width} height={slide.height} alt={"Zoomed View"} className="max-h-[90vh] object-contain" />
                                </div>
                            );
                        }
                        
                        return null;
                    }
                }} />

        </>
    );
}

export default ZoomableImage;


