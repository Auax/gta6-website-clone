import {useEffect, useRef} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

import logo from "../assets/logo.svg";
import heroImageBg from "../assets/hero-img-bg.webp";
import heroImageLayer2 from "../assets/hero-img-layer-2.png";
import {logoData} from "../assets/logo";
import {debounceFunc} from "../lib/debounce";
import {animateText, radialReveal} from "../lib/gsap/animations";

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


        // Align mask logo to the logo container and recalculate it when the window is resized
        useEffect(() => {
            const calculateMaskLogoTransform = () => {
                // What we are doing in the following lines is move the mask logo to the same position as the logo container,
                // so they are aligned in the animation, also scaling it to the same size too

                if (!logoContainer.current || !logoMask.current) {
                    alert("Something went wrong!");
                    console.warn("[ERROR] logoContainer or logoMask not found when calculating mask logo transform.");
                    return;
                }

                window.requestAnimationFrame(() => {
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

                    // Apply the transform with gsap
                    gsap.set(logoMask.current, {
                        translateX: logoHorizontalPosition,
                        translateY: logoVerticalPosition,
                        scale: logoScaleFactor
                    });

                    console.log(`Mask position calculated: translate(${logoHorizontalPosition}, ${logoVerticalPosition}) scale(${logoScaleFactor}) W: ${window.innerWidth}`);
                });
            }

            /**
             * Sets the transform origin of the given ref to the center of the screen.
             * It works for elements already centered horizontally, this will position the transform origin in the center of the screen vertically
             * This is used to ensure that the animation is centered on the screen.
             * @param {React.MutableRefObject<HTMLElement>} ref - The ref to the element to set the transform origin for.
             */
            const setCenterOriginVertical = (ref) => {

                const rect = ref.current.getBoundingClientRect();

                const screenCenterY = window.innerHeight / 2;

                // Get the offset of the screen center *relative to the top-left corner of the box*
                const originY = screenCenterY - rect.top;

                gsap.set(ref.current, {
                    transformOrigin: `50% ${originY}px`
                });
            }

            const calculateRevealOriginTransform = () => {
                if (!logoContainer.current || !overlayCopy.current) {
                    alert("Something went wrong!");
                    console.warn("[ERROR] logoContainer or overlayCopy not found when calculating the reveal origin.");
                    return;
                }
                window.requestAnimationFrame(() => {
                    // Set center origin for logo container and overlay
                    setCenterOriginVertical(logoContainer);
                    setCenterOriginVertical(overlayCopy);
                    console.log('Origin set to center for logo container and overlay');
                });
            }

            // Initial calculation
            calculateMaskLogoTransform();
            calculateRevealOriginTransform();

            // Fall back to window resize for global layout changes
            const handleWindowResize = debounceFunc(() => {
                calculateMaskLogoTransform();
                calculateRevealOriginTransform();
            }, 1000);

            // The debounced function will be called every 1000ms, this is to avoid too many calls when the window is resized too quickly
            window.addEventListener('resize', handleWindowResize);

            return () => {
                window.removeEventListener('resize', handleWindowResize);
            };
        }, [logoContainer, logoMask, overlayCopy, container]);


        const ANIMATION_END_MULT_FACTOR = 5;

        // Comments are the default values initially, tweak this values to adjust the animations
        const SCALE_PROGRESS_END = 0.55; // 0.6

        const RADIAL_IN_START = SCALE_PROGRESS_END; // 0.6
        const RADIAL_IN_END = RADIAL_IN_START + 0.2; // 0.7

        const RADIAL_OUT_START = 0.8; // 0.7
        const RADIAL_OUT_END = 1; // 1

        const LOGO_CONTAINER_SCALE_DOWN_START = 0.6; // 0.6
        const LOGO_CONTAINER_SCALE_DOWN_IN_MAX = 0.8; // 0.8

        const REVEAL_TEXT_START = LOGO_CONTAINER_SCALE_DOWN_START - 0.1; // 0.5
        const REVEAL_TEXT_IN_MAX = LOGO_CONTAINER_SCALE_DOWN_IN_MAX - 0.1; // 0.7

        const REVEAL_TEXT_ANIMATION_START = REVEAL_TEXT_START + 0.2; // 0.7
        const REVEAL_TEXT_ANIMATION_END = REVEAL_TEXT_ANIMATION_START + 0.2; // 0.8

        useGSAP(() => {
                ScrollTrigger.create({
                    trigger: ".hero",
                    start: "top top",
                    end: `${window.innerHeight * ANIMATION_END_MULT_FACTOR}px`,
                    pin: true,
                    pinSpacing: true,
                    scrub: true,
                    markers: true,

                    onUpdate: (self) => {
                        const progress = self.progress;

                        /*** Fade out hero logo and description (progress 0 → 0.1) ***/
                        const fadeOpacity = 1 - progress / 0.1;
                        gsap.set(
                            [heroImgLogo.current, heroImgDescription.current],
                            {opacity: progress <= 0.1 ? fadeOpacity : 0}
                        );

                        /*** Main image & overlay scaling animation (progress 0 → 0.6) ***/
                        if (progress <= SCALE_PROGRESS_END) {
                            const normalizedProgress = gsap.utils.mapRange(0, SCALE_PROGRESS_END, 0, 1, progress);
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
                        if (progress >= RADIAL_IN_START && progress <= RADIAL_IN_END) {
                            const revealProgress = gsap.utils.mapRange(RADIAL_IN_START, RADIAL_IN_END, 0, 1, progress);

                            // Gradient starts low (400%) and moves up 400 units to 0%
                            radialReveal(radialOverlay, progress, revealProgress, 400, 0);

                            gsap.set(radialOverlay.current, {
                                opacity: revealProgress / 0.5,
                            });
                        }

                        /*** Radial hide (progress 0.7 → 1) ***/
                        if (progress >= RADIAL_OUT_START && progress <= RADIAL_OUT_END) {

                            const revealProgress = gsap.utils.mapRange(RADIAL_OUT_START, RADIAL_OUT_END, 0, 1, progress);
                            // Fade out faster but start later
                            const logoOpacity = gsap.utils.mapRange(RADIAL_OUT_START, RADIAL_OUT_END - 0.1, 1, 0, progress);

                            radialReveal(radialOverlay, progress, revealProgress, 0, -500);

                            gsap.set(logoContainer.current, {
                                opacity: logoOpacity
                            });
                        }

                        /*** Logo container scaling down ***/
                        if (progress > LOGO_CONTAINER_SCALE_DOWN_START) {
                            const revealProgress = gsap.utils.mapRange(LOGO_CONTAINER_SCALE_DOWN_START, LOGO_CONTAINER_SCALE_DOWN_IN_MAX, 0, 1, progress);
                            // Scale down at different rate than the text reveal
                            const scale = gsap.utils.interpolate(1, 0.9, revealProgress);

                            gsap.set(logoContainer.current, {
                                scale: scale
                            });
                        }

                        /*** Overlay copy scale and opacity animation ***/
                        if (progress >= REVEAL_TEXT_START && progress <= REVEAL_TEXT_IN_MAX) {
                            const overlayCopyRevealProgress = gsap.utils.mapRange(REVEAL_TEXT_START, REVEAL_TEXT_IN_MAX, 0, 1, progress);
                            const overlayCopyScale = gsap.utils.interpolate(1.3, 1, overlayCopyRevealProgress);

                            gsap.set(overlayCopy.current, {
                                scale: overlayCopyScale,
                                opacity: overlayCopyRevealProgress, // Fade in from 0 → 1
                            });

                        } else if (progress < REVEAL_TEXT_START - 0.1) {
                            // Ensure overlay text is hidden before reveal phase starts
                            gsap.set(overlayCopy.current, {opacity: 0});
                        }

                        /*** Color gradient text effect (progress 0.7 → 0.8) ***/
                        if (progress > REVEAL_TEXT_ANIMATION_START) {
                            const revealProgress = gsap.utils.mapRange(REVEAL_TEXT_ANIMATION_START, REVEAL_TEXT_ANIMATION_END, 0, 1, progress);
                            animateText(overlayCopy, revealProgress)
                        }
                    }

                });

            },
            {
                scope: container, dependencies:
                    []
            }
        )
        ; // scope: The container ref. dependencies: [] means run once on mount.

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
