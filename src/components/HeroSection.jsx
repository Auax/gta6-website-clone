import {useEffect, useRef} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

import logo from "../assets/logo.svg";
import heroImageBg from "../assets/hero-img-bg.webp";
import heroImageLayer2 from "../assets/hero-img-layer-2.png";
import {logoData} from "../assets/logo";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HeroSection = () => {

        const container = useRef();
        const heroSection = useRef();
        const heroImgContainer = useRef();
        const heroImgLogo = useRef();
        const heroImgDescription = useRef();
        const fadeOverlay = useRef();
        const svgOverlay = useRef();
        const overlayCopy = useRef();
        const radialOverlay = useRef();
        const logoContainer = useRef();
        const logoMask = useRef();
        const logoMaskOverlay = useRef();

        const initialOverlayScale = 300;
        const initialOverlayOffsetX = 70; // In %

        const ANIMATION_END_MULT_FACTOR = 5;


        // Align mask logo to the logo container and recalculate it when the window is resized
        useEffect(() => {
            const handleResize = () => {
                // What we are doing in the following lines is move the mask logo to the same position as the logo container,
                // so they are aligned in the animation, also scaling it to the same size too

                // Get the dimensions of the bounding box of the logo container
                const logoDimensions = logoContainer.current.getBoundingClientRect();
                // Get the dimensions of the bounding box of the  logo mask
                const logoBoundingBox = logoMask.current.getBBox();

                // Calculate the horizontal and vertical scale ratios
                const horizontalScaleRatio = logoDimensions.width / logoBoundingBox.width;
                const verticalScaleRatio = logoDimensions.height / logoBoundingBox.height;

                // Calculate the logo scale factor by taking the minimum of the horizontal and vertical scale ratios
                const logoScaleFactor = Math.min(horizontalScaleRatio, verticalScaleRatio);

                // Calculate the horizontal and vertical positions of the logo
                const logoHorizontalPosition = logoDimensions.left + (logoDimensions.width - logoBoundingBox.width * logoScaleFactor) / 2 - logoBoundingBox.x * logoScaleFactor;
                const logoVerticalPosition = logoDimensions.top + (logoDimensions.height - logoBoundingBox.height * logoScaleFactor) / 2 - logoBoundingBox.y * logoScaleFactor;

                // Apply the transform to the logo mask
                logoMask.current.setAttribute('transform', `translate(${logoHorizontalPosition}, ${logoVerticalPosition}) scale(${logoScaleFactor})`);

            };
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
        }, [logoContainer, logoMask]);


        useGSAP(() => {
                ScrollTrigger.create({
                    trigger: ".hero",
                    start: "top top",
                    end: `${window.innerHeight * ANIMATION_END_MULT_FACTOR}px`,
                    pin: true,
                    pinSpacing: true,
                    scrub: true,
                    // markers: true,

                    onUpdate: (self) => {
                        const progress = self.progress;
                        const fadeOpacity = 1 - progress / 0.15; // Fade out over 0.15 seconds

                        if (progress <= 0.15) {
                            gsap.set([heroImgLogo.current, heroImgDescription.current],
                                {opacity: fadeOpacity}
                            );
                        } else {
                            gsap.set([heroImgLogo.current, heroImgDescription.current],
                                {opacity: 0}
                            );
                        }

                        if (progress <= 0.85) {
                            const normalizedProgress = progress / 0.85; // Normalize from 0 -> 1 to 0 -> 0.85
                            const heroImgContainerScale = 1.5 - 0.5 * normalizedProgress;
                            const overlayScale = initialOverlayScale * Math.pow(1 / initialOverlayScale, normalizedProgress); // Scale based on exponential curve
                            // calculate 1/x function with exponential and subtract the normalized progress that goes from 0 to 1
                            let overlayOffsetX = initialOverlayOffsetX * Math.pow(1 / initialOverlayOffsetX, normalizedProgress) - (normalizedProgress);
                            let fadeOverlayOpacity = 0;

                            gsap.set(heroImgContainer.current, {
                                scale: heroImgContainerScale,
                            });

                            gsap.set(svgOverlay.current, {
                                scale: overlayScale,
                                translateX: `${overlayOffsetX}%`
                            });

                            if (progress >= 0.25) {
                                fadeOverlayOpacity = Math.min(1, (progress - 0.25) / 0.4);
                            }

                            gsap.set(fadeOverlay.current, {
                                opacity: fadeOverlayOpacity
                            });
                        }

                        // Radial gradient overlay reveal
                        if (progress >= 0.6) {
                            const revealProgress = (progress - 0.6) / 0.4; // Normalize (note that 0.4 is 1 - 0.6)
                            // 400 is the base position at the bottom, the larger this number the lower the gradient is
                            // 200 is how much the gradient moves up in the animation
                            const radialGradientBottomPosition = 400 - revealProgress * 170;

                            gsap.set(radialOverlay.current, {
                                maskImage: `radial-gradient(circle at 50% ${radialGradientBottomPosition}%, #000 70%, transparent 80%)`,
                                opacity: revealProgress / 0.5 // The 0.5 is to increase faster the opacity
                            });
                        }

                        if (progress >= 0.85) {
                            const revealProgress = (progress - 0.85) / 0.15;
                            const color1 = gsap.utils.interpolate("rgb(233, 66, 119)", "rgb(255, 211, 125)", revealProgress);
                            const color2 = gsap.utils.interpolate("rgb(32, 31, 66)", "rgb(233, 66, 119)", revealProgress);

                            overlayCopy.current.style.backgroundClip = 'text';

                            gsap.set(overlayCopy.current, {
                                backgroundImage: `
                                radial-gradient(circle at 50% ${100 - revealProgress * 100}%, 
                                ${color1} 0%, 
                                ${color2} 70%)`,
                            });
                        }

                        // Overlay copy
                        if (progress >= 0.6 && progress <= 0.85) {
                            const overlayCopyRevealProgress = (progress - 0.6) / 0.25;
                            const overlayCopyScale = 1.25 - (progress - 0.6);

                            gsap.set(overlayCopy.current, {
                                scale: overlayCopyScale,
                                opacity: overlayCopyRevealProgress
                            });


                        } else if (progress < 0.6) {
                            gsap.set(overlayCopy.current, {
                                opacity: 0
                            });
                        }
                    }
                });
            }, {scope: container, dependencies: []}
        ); // scope: The container ref. dependencies: [] means run once on mount.

        return (
            <div ref={container}>
                <section className="hero" ref={heroSection}>
                    <div className="hero-img-container" ref={heroImgContainer}>
                        <img src={heroImageBg} alt=""/>

                        <div className="hero-img-logo" ref={heroImgLogo}>
                            <img src={logo} alt=""/>
                        </div>

                        <img src={heroImageLayer2} alt=""/>

                        <div className="hero-img-description" ref={heroImgDescription}>
                            <p>Scroll down to reveal</p>
                        </div>
                    </div>

                    <div className="fade-overlay" ref={fadeOverlay}/>

                    {/* This is the logo that will be revealed and is used as the mask */}
                    <div className="overlay" ref={svgOverlay}>
                        <svg width="100%" height="100%" style={{zIndex: 10}}>
                            <defs>
                                <mask id="logoRevealMask">
                                    <rect width="100%" height="100%" fill="white"/>
                                    <path id="logoMask" ref={logoMask} d={logoData}/>
                                </mask>
                            </defs>
                            <rect
                                ref={logoMaskOverlay}
                                width="100%"
                                height="100%"
                                fill="#111117"
                                mask="url(#logoRevealMask)"/>
                        </svg>
                    </div>

                    {/* Logo container indicates the position and dimensions where the logo will end up */}
                    <div className="logo-container" ref={logoContainer}/>

                    <div className="radial-fade-overlay" ref={radialOverlay}>
                        <div className="overlay-copy">
                            <h1 ref={overlayCopy}>
                                LOREM<br/>
                                IPSUM DOLOR<br/>
                                SIT AMET<br/>
                            </h1>
                        </div>
                    </div>


                </section>
                <section className="outro">
                    <p>Lorem ipsum dolor sit amet!</p>
                </section>
            </div>
        );
    }
;

export default HeroSection;
