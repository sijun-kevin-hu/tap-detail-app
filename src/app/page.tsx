"use client";

import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/features/marketing/NavBar';
import Logo from '@/components/ui/Logo';
import AppPreview from './_components/AppPreview';
import styles from './landing.module.css';

const workflow = [
    { title: 'Let clients book.', description: 'Share your booking link so clients can pick a service and request an appointment. Spend less time sorting through messages.', detail: 'Your services. Your booking page.' },
    { title: 'Arrive with the details.', description: 'Keep appointments, vehicle details, and client notes together. Know what’s coming up before you pack the van.', detail: 'A clearer plan for every job.' },
    { title: 'See what you earned.', description: 'Track completed jobs and revenue. Keep an eye on how your business is doing between appointments.', detail: 'Your work, accounted for.' },
];

export default function Home() {
    return (
        <div className={styles.landing}>
            <NavBar />
            <main>
                <section className={styles.hero} aria-labelledby="hero-title">
                    <div className={styles.heroCopy}>
                        <p className={styles.eyebrow}>Business software for mobile detailers</p>
                        <h1 id="hero-title">More time detailing.<br /><span>Less time managing.</span></h1>
                        <p className={styles.intro}>You take care of the finish. Tap Detail helps you keep bookings, client details, and earnings in one place—wherever the next job takes you.</p>
                        <div className={styles.actions}>
                            <Link href="/signup" className={styles.primary}>Get started <span aria-hidden="true">↗</span></Link>
                            <Link href="#how-it-works" className={styles.secondary}>See how it works <span aria-hidden="true">↓</span></Link>
                        </div>
                        <p className={styles.small}>Built for independent detailers and life on the road.</p>
                    </div>
                    <div className={styles.heroVisual}>
                        <div className={styles.photo}>
                            <Image src="/images/mobile-detailer.webp" alt="Mobile detailer wiping a silver SUV with a microfiber cloth on a driveway, with a detailing van nearby" fill priority sizes="(max-width: 850px) 100vw, 50vw" />
                        </div>
                        <div className={styles.photoCaption}>For the business behind the shine.</div>
                        <div className={styles.phone} aria-label="Illustrative schedule preview with sample appointments">
                            <div className={styles.phoneTop}><span>Tap Detail</span><span className={styles.demo}>Demo</span></div>
                            <p className={styles.phoneLabel}>YOUR DAY, AT A GLANCE</p>
                            <h2>Looking good today.</h2>
                            <div className={styles.appointment}><time>9:00 AM</time><strong>Full detail</strong><span>SUV · Jordan M.</span><span className={styles.confirmed}>Confirmed</span></div>
                            <div className={styles.nextJob}><time>1:30 PM</time><strong>Interior refresh</strong><span>Sedan · Alex R.</span></div>
                        </div>
                    </div>
                </section>

                <div className={styles.benefits} aria-label="Core features"><span>Online booking</span><span>Client & vehicle details</span><span>Job scheduling</span><span>Earnings tracking</span></div>

                <section id="how-it-works" className={styles.workflow} aria-labelledby="workflow-title">
                    <div className={styles.sectionHeading}><p className={styles.eyebrow}>From the first booking to the final wipe</p><h2 id="workflow-title">A little less admin.<br />A better working day.</h2><p>Keep the business side moving while you focus on the work in front of you.</p></div>
                    <ol className={styles.steps}>{workflow.map((step, index) => <li key={step.title}><span className={styles.stepNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p><span className={styles.stepDetail}>{step.detail}</span></li>)}</ol>
                </section>

                <section id="features" className={styles.product} aria-labelledby="product-title">
                    <div className={styles.productHeading}><div><p className={styles.eyebrow}>Your business, in view</p><h2 id="product-title">Pack the supplies.<br />Bring your whole business.</h2></div><p>Check your schedule, look up a client, and track your jobs from your phone. One place to pick up where you left off.</p></div>
                    <div className={styles.preview}><AppPreview /></div>
                    <p className={styles.previewCaption}>Illustrative product preview · Sample clients, appointments, and earnings</p>
                </section>

                <section className={styles.cta} aria-labelledby="cta-title"><p className={styles.eyebrow}>Made for the way you work</p><h2 id="cta-title">Your next job deserves<br />your full attention.</h2><p>Give the admin a home. Get back to the details.</p><Link href="/signup" className={styles.primary}>Get started with Tap Detail <span aria-hidden="true">↗</span></Link></section>
            </main>
            <footer className={styles.footer}><div><Logo /><p>Business software for mobile detailers.</p></div><Link href="/login">Log in</Link><p>© {new Date().getFullYear()} Tap Detail</p></footer>
        </div>
    );
}
