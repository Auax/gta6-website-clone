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

        const setCenterOrigin = (ref) => {
            const rect = ref.current.getBoundingClientRect();

            const screenCenterX = window.innerWidth / 2;
            const screenCenterY = window.innerHeight / 2;

            // Get the offset of the screen center *relative to the top-left corner of the box*
            const originX = screenCenterX - rect.left;
            const originY = screenCenterY - rect.top;

            gsap.set(ref.current, {
                transformOrigin: `${originX}px ${originY}px`
            });
        }

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

            const calculateRevealOriginTransform = () => {
                setCenterOrigin(logoContainer);
                setCenterOrigin(overlayCopy);
            }

            window.addEventListener('resize', handleResize);

            handleResize();
            calculateRevealOriginTransform();

            return () => window.removeEventListener('resize', handleResize);
        }, [logoContainer, logoMask]);


        const ANIMATION_END_MULT_FACTOR = 5;


        useGSAP(() => {
                ScrollTrigger.create({
                    trigger: ".hero",
                    start: "top top",
                    end: `${window.innerHeight * ANIMATION_END_MULT_FACTOR}px`,
                    pin: true,
                    pinSpacing: true,
                    scrub: true,

                    onUpdate: (self) => {
                        const progress = self.progress;

                        /*** Fade out hero logo and description (progress 0 → 0.1) ***/
                        const fadeOpacity = 1 - progress / 0.1;
                        gsap.set(
                            [heroImgLogo.current, heroImgDescription.current],
                            {opacity: progress <= 0.1 ? fadeOpacity : 0}
                        );

                        /*** Main image & overlay scaling animation (progress 0 → 0.6) ***/
                        if (progress <= 0.6) {
                            const normalizedProgress = gsap.utils.mapRange(0, 0.6, 0, 1, progress);
                            const heroImgContainerScale = gsap.utils.interpolate(1.5, 1, normalizedProgress);

                            // Scale overlay exponentially from `initialOverlayScale` to 1
                            const overlayScale = initialOverlayScale * Math.pow(1 / initialOverlayScale, normalizedProgress);

                            // Offset overlay horizontally, including a subtractive adjustment for curve correction
                            const overlayOffsetX =
                                initialOverlayOffsetX * Math.pow(1 / initialOverlayOffsetX, normalizedProgress) - normalizedProgress;


                            const fadeOverlayOpacity = gsap.utils.mapRange(0.2, 0.5, 0, 1, progress);

                            gsap.set(heroImgContainer.current, {scale: heroImgContainerScale});
                            gsap.set(svgOverlay.current, {
                                scale: overlayScale,
                                translateX: `${overlayOffsetX}%`,
                            });
                            gsap.set(fadeOverlay.current, {opacity: fadeOverlayOpacity});

                            // Show SVG mask logo, hide the logo container while scaling
                            gsap.set(logoContainer.current, {opacity: 0});
                            gsap.set(logoMask.current, {opacity: 1});
                        } else {
                            /*** After progress > 0.45: fade in logo over radial overlay ***/
                            gsap.set(logoContainer.current, {opacity: 1});
                            gsap.set(logoMask.current, {opacity: 0});
                        }

                        /*** Radial gradient mask reveal (progress 0.6 → 0.7) ***/
                        if (progress >= 0.6 && progress <= 0.7) {
                            const revealProgress = gsap.utils.mapRange(0.6, 0.7, 0, 1, progress);

                            // Gradient starts low (400%) and moves up 400 units to 0%
                            const gradientPos = gsap.utils.interpolate(400, 0, revealProgress);

                            gsap.set(radialOverlay.current, {
                                maskImage: `radial-gradient(circle at 50% ${gradientPos}%, #000 70%, transparent 80%)`,
                                opacity: revealProgress / 0.5,
                            });
                        }

                        /*** Radial hide (progress 0.7 → 1) ***/
                        if (progress > 0.7) {
                            const revealProgress = gsap.utils.mapRange(0.7, 1, 0, 1, progress);
                            const gradientPos = gsap.utils.interpolate(0, -500, revealProgress);
                            // Fade out faster but start later
                            const logoOpacity = gsap.utils.mapRange(0.7, 1, 1, 0, progress);

                            gsap.set(radialOverlay.current, {
                                maskImage: `radial-gradient(circle at 50% ${gradientPos}%, #000 70%, transparent 90%)`,
                            });

                            gsap.set(logoContainer.current, {
                                opacity: logoOpacity
                            });
                        }

                        /*** Logo container scaling down (progress 0.6 → 0.8) ***/
                        if (progress > 0.6) {
                            const revealProgress = gsap.utils.mapRange(0.6, 0.8, 0, 1, progress);

                            // Scale down at different rate than the text reveal
                            const scale = gsap.utils.interpolate(1, 0.9, revealProgress);

                            gsap.set(logoContainer.current, {
                                scale: scale
                            });
                        }

                        /*** Overlay copy scale and opacity animation (progress 0.5 → 0.7) ***/
                        if (progress >= 0.5 && progress <= 0.7) {
                            const overlayCopyRevealProgress = gsap.utils.mapRange(0.5, 0.7, 0, 1, progress);
                            const overlayCopyScale = gsap.utils.interpolate(1.3, 1, overlayCopyRevealProgress);

                            gsap.set(overlayCopy.current, {
                                scale: overlayCopyScale,
                                opacity: overlayCopyRevealProgress, // Fade in from 0 → 1
                            });

                        } else if (progress < 0.5) {
                            // Ensure overlay text is hidden before reveal phase starts
                            gsap.set(overlayCopy.current, {opacity: 0});
                        }

                        /*** Color gradient text effect (progress 0.7 → 0.8) ***/
                        if (progress > 0.7) {
                            const revealProgress = gsap.utils.mapRange(0.7, 0.8, 0, 1, progress);

                            // Interpolates from pink → yellow and navy → pink
                            const color1 = gsap.utils.interpolate("rgb(233, 66, 119)", "rgb(255, 211, 125)", revealProgress);
                            const color2 = gsap.utils.interpolate("rgb(32, 31, 66)", "rgb(233, 66, 119)", revealProgress);

                            // Interpolates from 1 → 0.9
                            const scale = gsap.utils.interpolate(1, 0.9, revealProgress);

                            overlayCopy.current.style.backgroundClip = 'text';
                            gsap.set(overlayCopy.current, {
                                backgroundImage: `
                                radial-gradient(circle at 50% ${100 - revealProgress * 100}%, 
                                ${color1} 0%, 
                                ${color2} 70%)`,
                                scale: scale,
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
