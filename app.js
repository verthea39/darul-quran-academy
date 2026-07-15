/**
 * Darul Quran Academy - Web Interactivity & UI Logic
 * Contains: Navigation scroll states, dynamic tabs, counter animations,
 * scroll reveals, form processing, mock checkout modal, and toast alerts.
 */

import { createClient } from '@supabase/supabase-js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Supabase Configuration ---
    window.supabaseClient = null;
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        if (supabaseUrl && supabaseKey) {
            window.supabaseClient = createClient(supabaseUrl, supabaseKey);
        } else {
            console.warn('Supabase environment variables are missing. Database features will not work.');
        }
    } catch (e) {
        console.error('Failed to initialize Supabase. Are you running via Vite server?', e);
    }

    // --- DOM Elements ---
    const header = document.getElementById('site-header');
    const progressBar = document.getElementById('scroll-progress-bar');
    const backToTopBtn = document.getElementById('back-to-top');
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // --- Sticky Header & Scroll Progress ---
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Update Scroll Progress Bar
        if (docHeight > 0) {
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        }

        // Header Background Solid Transition
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back To Top Visibility
        if (scrollTop > 400) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    // Back to Top Click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // --- Mobile Menu Toggle Drawer ---
    const toggleMobileMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        // Prevent body scroll when drawer is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });


    // --- Active Link Highlighting on Scroll (Intersection Observer) ---
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies core viewport area
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });


    // --- Scroll Reveal Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserverOptions = {
        root: null,
        threshold: 0.15, // trigger when 15% visible
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: Unobserve after revealing to prevent repetitive animations
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // --- Numeric Stats Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    const animateCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            if (isNaN(target)) return;
            const duration = 2000; // 2 seconds animation
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + '+';
                }
            }, stepTime);
        });
    };

    // Trigger counter when stats section enters screen
    const statsPanel = document.querySelector('.stats-panel');
    if (statsPanel) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    animateCounters();
                    countersAnimated = true;
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsPanel);
    }


    // --- Toast Alert Notification System ---
    const toast = document.getElementById('toast-notification');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    let toastTimeout;
    const showToast = (title, message, type = 'success') => {
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        if (type === 'success') {
            toastIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            toast.style.borderLeftColor = 'var(--accent-color)';
        } else if (type === 'info') {
            toastIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
            toast.style.borderLeftColor = 'var(--secondary-color)';
        }
        
        toast.classList.add('active');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 5000); // hides in 5s
    };


    // --- Admission Inquiry Form Handler ---
    const inquiryForm = document.getElementById('inquiry-form');
    window.handleInquirySubmit = () => {
        const studentName = document.getElementById('student-name').value;
        const studentAge = document.getElementById('student-age').value;
        const programSelect = document.getElementById('desired-program');
        const programName = programSelect.options[programSelect.selectedIndex].text;
        const phone = document.getElementById('guardian-phone').value;
        
        const submitBtn = document.getElementById('inquiry-submit-btn');
        const originalText = submitBtn.textContent;
        
        // Simulating loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing Form...';
        
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            showToast(
                'Inquiry Submitted Successfully!',
                `Thank you. The Academy committee will call you at ${phone} to discuss ${studentName}'s enrollment in the ${programName}.`,
                'success'
            );
            
            inquiryForm.reset();
        }, 1200);
    };


    // --- Interactive Donation Portal Logic ---
    const donationTabs = document.querySelectorAll('.donation-tab');
    const causeInput = document.getElementById('selected-cause-input');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const customAmountInput = document.getElementById('custom-amount');
    
    let activeAmount = 1000; // default preset amount

    // Tab Switching
    donationTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            donationTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Map cause key to readable text
            const cause = tab.getAttribute('data-cause');
            if (cause === 'hifz-sponsorship') {
                causeInput.value = 'Sponsor Huffaz Program';
            } else if (cause === 'infrastructure') {
                causeInput.value = 'Academy Expansion & Building Fund';
            } else if (cause === 'general-sadaqah') {
                causeInput.value = 'General Sadaqah & Zakat Fund';
            }
        });
    });

    // Preset Amount Clicks
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            customAmountInput.value = ''; // clear custom
            activeAmount = parseInt(btn.getAttribute('data-val'), 10);
        });
    });

    // Custom Amount input resets presets
    customAmountInput.addEventListener('input', () => {
        if (customAmountInput.value !== '') {
            presetButtons.forEach(b => b.classList.remove('active'));
            activeAmount = parseInt(customAmountInput.value, 10);
        } else {
            // Re-activate first preset if cleared
            presetButtons[0].classList.add('active');
            activeAmount = parseInt(presetButtons[0].getAttribute('data-val'), 10);
        }
    });


    // --- Simulated Donation Modal System ---
    const donationModal = document.getElementById('donation-modal');
    const modalClose = document.getElementById('modal-close');
    const modalDonorName = document.getElementById('modal-donor-name');
    const modalAmount = document.getElementById('modal-amount');
    const modalCause = document.getElementById('modal-cause');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const donationForm = document.getElementById('donation-form');

    // Submission triggers checkout modal
    window.handleDonationSubmit = () => {
        const donorName = document.getElementById('donor-name').value;
        const donorPhone = document.getElementById('donor-phone').value;
        
        // Finalize amount
        let finalAmount = activeAmount;
        if (customAmountInput.value !== '') {
            finalAmount = parseInt(customAmountInput.value, 10);
        }
        
        if (!finalAmount || finalAmount < 100) {
            showToast('Invalid Amount', 'Minimum donation amount is ₹100.', 'info');
            return;
        }

        // Set Modal Data
        modalDonorName.textContent = donorName;
        modalAmount.textContent = `₹ ${finalAmount.toLocaleString('en-IN')}`;
        modalCause.textContent = causeInput.value;
        
        // Open Modal
        donationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close Modal
    const closeModal = () => {
        donationModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeModal);
    
    // Close modal if clicking overlay background
    donationModal.addEventListener('click', (e) => {
        if (e.target === donationModal) {
            closeModal();
        }
    });

    // Confirm Payment
    confirmPaymentBtn.addEventListener('click', () => {
        closeModal();
        
        const donorName = document.getElementById('donor-name').value;
        
        // Show success toast
        showToast(
            'Sadaqah Received!',
            `Jazakallah Khair, ${donorName}! Your mock payment has been processed. A receipt has been dispatched to your email address.`,
            'success'
        );
        
        donationForm.reset();
        // Reset defaults
        presetButtons.forEach(b => b.classList.remove('active'));
        presetButtons[0].classList.add('active');
        activeAmount = 1000;
        causeInput.value = 'Sponsor Huffaz Program';
        donationTabs.forEach(t => t.classList.remove('active'));
        donationTabs[0].classList.add('active');
    });

});
