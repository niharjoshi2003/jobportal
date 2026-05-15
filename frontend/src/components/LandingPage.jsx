import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Building2, Globe, Users, CheckCircle, Shield,
    GraduationCap, Target, Zap, Star, ChevronDown, TrendingUp, Award,
    Sparkles, ArrowUpRight, MapPin, Heart, Linkedin, Send,
    Twitter, Mail, ChevronRight, Play, Menu, X, MessageSquare
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import BrandLogo from './shared/BrandLogo';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
    })
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

const CountUp = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration, inView]);

    return <span ref={ref}>{count}{suffix}</span>;
};

const SectionLabel = ({ icon: Icon, text, color = 'primary' }) => {
    const colors = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return (
        <motion.div variants={fadeUp} custom={0}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase ${colors[color]}`}>
            <Icon size={13} />
            {text}
        </motion.div>
    );
};

const LanguageSwitcher = ({ lang, onToggle }) => (
    <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.10] rounded-xl p-1">
        <button
            onClick={() => onToggle('en')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${lang === 'en'
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-muted-foreground hover:text-foreground'
                }`}
        >
            <span>🇺🇸</span> EN
        </button>
        <button
            onClick={() => onToggle('ja')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${lang === 'ja'
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-muted-foreground hover:text-foreground'
                }`}
        >
            <span>🇯🇵</span> JA
        </button>
    </div>
);

const LandingPage = () => {
    const { t } = useTranslation();
    const { user } = useSelector(store => store.auth);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [lang, setLang] = useState(i18n.language || 'en');
    const [contactForm, setContactForm] = useState({ name: '', company: '', email: '', interest: '', message: '' });
    const [contactStatus, setContactStatus] = useState('idle'); // idle | submitting | success

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setContactStatus('submitting');
        setTimeout(() => {
            setContactStatus('success');
            setContactForm({ name: '', company: '', email: '', interest: '', message: '' });
        }, 1200);
    };

    const handleLangToggle = (newLang) => {
        i18n.changeLanguage(newLang);
        localStorage.setItem('lang', newLang);
        setLang(newLang);
    };

    const hostCompanies = [
        { name: 'PiPhotonics Inc.', field: 'Photonics & Lasers' },
        { name: 'Artience Co., Ltd.', field: 'Materials Science' },
        { name: 'Ishizaka Inc.', field: 'Environmental Tech' },
        { name: 'Accenture Japan', field: 'IT Consulting' },
        { name: 'Bossard Japan', field: 'Industrial Engineering' },
        { name: 'GERD Japan', field: 'Green Energy R&D' },
    ];

    const navLinks = [
        { label: t('nav.about'), href: '#about' },
        { label: t('nav.problem'), href: '#problem' },
        { label: t('nav.solution'), href: '#solution' },
        { label: t('nav.companies'), href: '#companies' },
        { label: t('nav.whyUs'), href: '#why-us' },
        { label: t('nav.contact'), href: '#contact' },
    ];

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* ━━━ Navbar ━━━ */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/10' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/"><BrandLogo size="md" /></Link>

                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-all">
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageSwitcher lang={lang} onToggle={handleLangToggle} />
                        {user ? (
                            <Link to="/dashboard" className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25">
                                {t('nav.dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link to="/portal-login" className="hidden md:block px-3 py-2 text-muted-foreground rounded-lg text-xs font-medium hover:text-foreground hover:bg-white/5 transition-colors">
                                    Recruiter / Admin
                                </Link>
                                <Link to="/login" className="hidden sm:block px-4 py-2 text-foreground rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                                    {t('nav.login')}
                                </Link>
                                <Link to="/signup" className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40">
                                    {t('nav.getStarted')}
                                </Link>
                            </>
                        )}
                        <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenu && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
                            <div className="px-4 py-4 space-y-1">
                                {navLinks.map(link => (
                                    <a key={link.href} href={link.href} onClick={() => setMobileMenu(false)}
                                        className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-all">
                                        {link.label}
                                    </a>
                                ))}
                                {!user && (
                                    <Link to="/portal-login" onClick={() => setMobileMenu(false)}
                                        className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-all">
                                        Recruiter / Admin login
                                    </Link>
                                )}
                                <div className="pt-2 px-4">
                                    <LanguageSwitcher lang={lang} onToggle={handleLangToggle} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ━━━ Hero ━━━ */}
            <section className="relative pt-28 pb-10 sm:pt-36 sm:pb-16 px-4 sm:px-6 lg:px-8 hero-mesh min-h-[90vh] flex items-center">
                <div className="absolute inset-0 grid-bg" />

                <div className="absolute top-32 left-[10%] w-3 h-3 rounded-full bg-primary/40 animate-float" />
                <div className="absolute top-60 right-[15%] w-2 h-2 rounded-full bg-purple-400/40 animate-float-delayed" />
                <div className="absolute bottom-40 left-[20%] w-2 h-2 rounded-full bg-pink-400/30 animate-float" />

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-5xl mx-auto">
                        <motion.div variants={fadeUp} custom={0}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold mb-10 tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                            <span className="text-muted-foreground">{t('hero.badge_from')}</span>
                            <ArrowRight size={12} className="text-primary" />
                            <span className="text-muted-foreground">{t('hero.badge_to')}</span>
                            <span className="text-base ml-1">🇮🇳 🇯🇵</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} custom={1}
                            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] mb-8 tracking-tight">
                            <span className="text-foreground">{t('hero.title1')}</span>
                            <br />
                            <span className="text-gradient">{t('hero.title2')}</span>
                            <br />
                            <span className="text-foreground">{t('hero.title3')}</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} custom={2}
                            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                            {t('hero.subtitle')}{' '}
                            <span className="text-foreground font-medium">{t('hero.subtitle_highlight')}</span>
                            {t('hero.subtitle_end')}
                        </motion.p>

                        <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup"
                                className="group flex items-center gap-2.5 px-8 py-4 bg-primary text-white rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">
                                {t('hero.cta_primary')}
                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <a href="#about"
                                className="group flex items-center gap-2.5 px-8 py-4 bg-white/[0.04] border border-white/[0.08] text-foreground rounded-2xl text-sm font-semibold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all">
                                {t('hero.cta_secondary')}
                                <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Stats Strip */}
                    <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible"
                        className="mt-20 sm:mt-28 max-w-5xl mx-auto">
                        <div className="glow-line mb-8" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
                            {[
                                { value: 789, suffix: 'K+', label: t('stats.gap_label'), sub: t('stats.gap_sub') },
                                { value: 200, suffix: '+', label: t('stats.institutions_label'), sub: t('stats.institutions_sub') },
                                { value: 50, suffix: '+', label: t('stats.companies_label'), sub: t('stats.companies_sub') },
                                { value: 95, suffix: '%', label: t('stats.conversion_label'), sub: t('stats.conversion_sub') },
                            ].map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient mb-2">
                                        <CountUp end={stat.value} suffix={stat.suffix} />
                                    </p>
                                    <p className="text-sm font-medium text-foreground">{stat.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                        <div className="glow-line mt-8" />
                    </motion.div>
                </div>
            </section>

            {/* ━━━ Company Marquee ━━━ */}
            <section className="py-12 border-y border-border/30 bg-white/[0.01] overflow-hidden">
                <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-8">{t('marquee.tagline')}</p>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
                    <div className="flex animate-marquee">
                        {[...hostCompanies, ...hostCompanies, ...hostCompanies].map((c, i) => (
                            <div key={i} className="flex items-center gap-3 mx-10 flex-shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">{c.name.charAt(0)}</span>
                                </div>
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ About Us ━━━ */}
            <section id="about" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
                            <SectionLabel icon={Heart} text={t('about.label')} />
                            <motion.h2 variants={fadeUp} custom={1}
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-6 mb-6 leading-tight">
                                {t('about.title1')}
                                <span className="text-gradient"> {t('about.title2')}</span>
                            </motion.h2>
                            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed mb-6">
                                {t('about.body1')}
                            </motion.p>
                            <motion.p variants={fadeUp} custom={3} className="text-muted-foreground leading-relaxed mb-8">
                                {t('about.body2')}
                            </motion.p>
                            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-3">
                                {[t('about.tag1'), t('about.tag2'), t('about.tag3'), t('about.tag4')].map(tag => (
                                    <span key={tag} className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-muted-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </motion.div>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={scaleIn}>
                            <div className="relative">
                                <div className="absolute inset-0 gradient-border rounded-3xl opacity-20 blur-xl" />
                                <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 sm:p-10 space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-14 h-14 rounded-2xl gradient-border flex items-center justify-center">
                                            <Globe size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{t('about.mission_title')}</h3>
                                            <p className="text-sm text-muted-foreground">{t('about.mission_sub')}</p>
                                        </div>
                                    </div>
                                    <div className="glow-line" />
                                    <div className="space-y-5">
                                        {[
                                            { icon: Shield, label: t('about.feature1_label'), value: t('about.feature1_value') },
                                            { icon: GraduationCap, label: t('about.feature2_label'), value: t('about.feature2_value') },
                                            { icon: TrendingUp, label: t('about.feature3_label'), value: t('about.feature3_value') },
                                            { icon: Globe, label: t('about.feature4_label'), value: t('about.feature4_value') },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                    <item.icon size={18} className="text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                                                    <p className="text-xs text-muted-foreground">{item.value}</p>
                                                </div>
                                                <ChevronRight size={14} className="text-muted-foreground/50" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━ Problem Statement ━━━ */}
            <section id="problem" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-red-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
                        className="text-center max-w-3xl mx-auto mb-16">
                        <SectionLabel icon={Target} text={t('problem.label')} color="red" />
                        <motion.h2 variants={fadeUp} custom={1}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-6 mb-5">
                            {t('problem.title')}
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed text-lg">
                            {t('problem.subtitle_start')}{' '}
                            <span className="text-red-400 font-semibold">{t('problem.subtitle_highlight')}</span>
                            {t('problem.subtitle_end')}
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
                            className="card-shine bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-8 hover:border-red-500/20 transition-all duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                    <span className="text-xl">🇯🇵</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{t('problem.japan_title')}</h3>
                                    <p className="text-xs text-red-400">{t('problem.japan_sub')}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {t('problem.japan_items', { returnObjects: true }).map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/[0.04] border border-red-500/[0.06] group hover:border-red-500/[0.12] transition-all">
                                        <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-red-400 text-[10px] font-bold">{i + 1}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
                            className="card-shine bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-8 hover:border-amber-500/20 transition-all duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                    <span className="text-xl">🇮🇳</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{t('problem.india_title')}</h3>
                                    <p className="text-xs text-amber-400">{t('problem.india_sub')}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {t('problem.india_items', { returnObjects: true }).map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.06] group hover:border-amber-500/[0.12] transition-all">
                                        <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-amber-400 text-[10px] font-bold">{i + 1}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━ Solution ━━━ */}
            <section id="solution" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute right-0 top-1/3 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
                        className="text-center max-w-3xl mx-auto mb-16">
                        <SectionLabel icon={Zap} text={t('solution.label')} color="green" />
                        <motion.h2 variants={fadeUp} custom={1}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-6 mb-5">
                            {t('solution.title')}
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
                            {t('solution.subtitle')}
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                        {[
                            { icon: Shield, gradient: 'from-blue-500/10 to-cyan-500/10', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
                            { icon: TrendingUp, gradient: 'from-emerald-500/10 to-green-500/10', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
                            { icon: GraduationCap, gradient: 'from-purple-500/10 to-violet-500/10', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
                            { icon: CheckCircle, gradient: 'from-emerald-500/10 to-teal-500/10', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
                            { icon: Award, gradient: 'from-amber-500/10 to-yellow-500/10', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
                            { icon: Globe, gradient: 'from-pink-500/10 to-rose-500/10', iconBg: 'bg-pink-500/10', iconColor: 'text-pink-400' },
                        ].map((meta, i) => {
                            const feature = t('solution.features', { returnObjects: true })[i];
                            return (
                                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                    variants={fadeUp} custom={i}
                                    className="group relative bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-7 hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1">
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl ${meta.iconBg} flex items-center justify-center mb-5`}>
                                            <meta.icon size={22} className={meta.iconColor} />
                                        </div>
                                        <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-white transition-colors">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ━━━ Target Audience ━━━ */}
            <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
                        className="text-center max-w-3xl mx-auto mb-16">
                        <SectionLabel icon={Users} text={t('audience.label')} color="purple" />
                        <motion.h2 variants={fadeUp} custom={1}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-6 mb-5">
                            {t('audience.title')}
                        </motion.h2>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                            className="relative group">
                            <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-8 sm:p-10 h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <GraduationCap size={26} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{t('audience.talent_title')}</h3>
                                        <p className="text-xs text-primary">{t('audience.talent_sub')}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {t('audience.talent_items', { returnObjects: true }).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                                            <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle size={12} className="text-primary" />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
                            className="relative group">
                            <div className="absolute -inset-px bg-gradient-to-br from-purple-500/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-8 sm:p-10 h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                        <Building2 size={26} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{t('audience.employer_title')}</h3>
                                        <p className="text-xs text-purple-400">{t('audience.employer_sub')}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {t('audience.employer_items', { returnObjects: true }).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                                            <div className="w-5 h-5 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle size={12} className="text-purple-400" />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━ Why Different ━━━ */}
            <section id="why-us" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
                            className="lg:col-span-2 lg:sticky lg:top-28">
                            <SectionLabel icon={Star} text={t('whyUs.label')} />
                            <motion.h2 variants={fadeUp} custom={1}
                                className="text-3xl sm:text-4xl font-bold text-foreground mt-6 mb-5">
                                {t('whyUs.title1')}
                                <span className="text-gradient"> {t('whyUs.title2')}</span>
                            </motion.h2>
                            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">
                                {t('whyUs.subtitle')}
                            </motion.p>
                        </motion.div>

                        <div className="lg:col-span-3 space-y-4">
                            {[Target, TrendingUp, GraduationCap, Shield, Award].map((Icon, i) => {
                                const feature = t('whyUs.features', { returnObjects: true })[i];
                                return (
                                    <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                        variants={fadeUp} custom={i}
                                        className="group border-glow rounded-2xl p-6 flex items-start gap-5 bg-card/40 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-2xl gradient-border flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-[15px]">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ Host Companies ━━━ */}
            <section id="companies" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
                        className="text-center max-w-3xl mx-auto mb-16">
                        <SectionLabel icon={Building2} text={t('partners.label')} color="amber" />
                        <motion.h2 variants={fadeUp} custom={1}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-6 mb-5">
                            {t('partners.title')}
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
                            {t('partners.subtitle')}
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                        {hostCompanies.map((company, i) => (
                            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                variants={fadeUp} custom={i}
                                className="group border-glow rounded-2xl p-6 bg-card/40 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/[0.06] flex items-center justify-center group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all">
                                        <span className="text-xl font-bold text-primary">{company.name.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-foreground truncate">{company.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">{company.field}</p>
                                        <div className="flex items-center gap-1 mt-1.5">
                                            <MapPin size={10} className="text-primary/60" />
                                            <span className="text-[10px] text-muted-foreground">Japan</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ How It Works ━━━ */}
            <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
                        className="text-center max-w-3xl mx-auto mb-16">
                        <SectionLabel icon={Play} text={t('howItWorks.label')} />
                        <motion.h2 variants={fadeUp} custom={1}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-6 mb-5">
                            {t('howItWorks.title')}
                        </motion.h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
                        <div className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-px">
                            <div className="w-full h-full bg-gradient-to-r from-primary/40 via-purple-400/40 to-pink-400/40" />
                        </div>

                        {['👤', '🔍', '🎯', '🚀'].map((icon, i) => {
                            const step = t('howItWorks.steps', { returnObjects: true })[i];
                            const colors = [
                                'from-blue-500/10 to-cyan-500/10',
                                'from-purple-500/10 to-violet-500/10',
                                'from-emerald-500/10 to-green-500/10',
                                'from-amber-500/10 to-yellow-500/10',
                            ];
                            return (
                                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                    variants={fadeUp} custom={i}
                                    className="text-center relative group">
                                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${colors[i]} border border-white/[0.06] flex items-center justify-center mx-auto mb-5 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                                        <span className="text-3xl">{icon}</span>
                                    </div>
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-[0.15em]">
                                        Step {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="font-bold text-foreground mt-2 mb-2 text-[15px]">{step.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ━━━ CTA ━━━ */}
            <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                        className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10" />
                        <div className="absolute inset-0 hero-mesh opacity-50" />
                        <div className="relative bg-card/70 backdrop-blur-xl m-[1px] rounded-3xl p-10 sm:p-16 text-center border border-white/[0.06]">
                            <motion.div variants={fadeUp} custom={0}
                                className="w-16 h-16 rounded-2xl gradient-border flex items-center justify-center mx-auto mb-8">
                                <Sparkles size={28} className="text-white" />
                            </motion.div>
                            <motion.h2 variants={fadeUp} custom={1}
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5">
                                {t('cta.title')}
                            </motion.h2>
                            <motion.p variants={fadeUp} custom={2}
                                className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                                {t('cta.subtitle')}
                            </motion.p>
                            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/signup"
                                    className="group flex items-center gap-2 px-8 py-4 bg-white text-background rounded-2xl text-sm font-bold hover:bg-white/90 transition-all shadow-2xl hover:-translate-y-0.5">
                                    {t('cta.student')} <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                                <Link to="/signup"
                                    className="group flex items-center gap-2 px-8 py-4 border border-white/20 text-foreground rounded-2xl text-sm font-bold hover:bg-white/10 hover:border-white/30 transition-all">
                                    {t('cta.recruiter')} <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ━━━ Contact Us ━━━ */}
            <section id="contact" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
                        className="text-center max-w-3xl mx-auto mb-16">
                        <SectionLabel icon={MessageSquare} text={t('contact.label')} color="primary" />
                        <motion.h2 variants={fadeUp} custom={1}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-6 mb-5">
                            {t('contact.title')}
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">
                            {t('contact.subtitle')}
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-6xl mx-auto">

                        {/* Left — Info column */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                            className="lg:col-span-2 space-y-6">
                            <motion.h3 variants={fadeUp} custom={0} className="text-lg font-bold text-foreground mb-2">
                                {t('contact.info_title')}
                            </motion.h3>
                            {t('contact.info_items', { returnObjects: true }).map((item, i) => {
                                const icons = [Sparkles, Target, Zap, Shield];
                                const Icon = icons[i];
                                return (
                                    <motion.div key={i} variants={fadeUp} custom={i + 1}
                                        className="flex items-start gap-4 p-5 bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl hover:border-primary/20 transition-all duration-300 group">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                            <Icon size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Direct contact details */}
                            <motion.div variants={fadeUp} custom={5}
                                className="p-5 bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl space-y-4">
                                <p className="text-sm font-semibold text-foreground">{t('contact.direct_title')}</p>
                                <a href={`mailto:${t('contact.email_value')}`}
                                    className="flex items-center gap-3 group/link">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover/link:bg-primary/20 transition-colors">
                                        <Mail size={15} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('contact.email_label')}</p>
                                        <p className="text-sm text-foreground font-medium group-hover/link:text-primary transition-colors">{t('contact.email_value')}</p>
                                    </div>
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* Right — Form */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
                            className="lg:col-span-3">
                            <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 sm:p-10">
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/[0.04] to-purple-500/[0.04] pointer-events-none" />
                                <div className="relative z-10">
                                    {contactStatus === 'success' ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center py-16 text-center gap-5">
                                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle size={36} className="text-emerald-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-foreground">{t('contact.success_title')}</h3>
                                            <p className="text-muted-foreground leading-relaxed max-w-sm">{t('contact.success_desc')}</p>
                                            <button onClick={() => setContactStatus('idle')}
                                                className="mt-2 px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">
                                                {t('nav.contact')} ↩
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleContactSubmit} className="space-y-5">
                                            <h3 className="text-lg font-bold text-foreground mb-6">{t('contact.form_title')}</h3>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        {t('contact.field_name')} *
                                                    </label>
                                                    <input
                                                        required
                                                        value={contactForm.name}
                                                        onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                                                        placeholder={t('contact.field_name')}
                                                        className="w-full px-4 py-3 bg-background/60 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        {t('contact.field_company')} *
                                                    </label>
                                                    <input
                                                        required
                                                        value={contactForm.company}
                                                        onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))}
                                                        placeholder={t('contact.field_company')}
                                                        className="w-full px-4 py-3 bg-background/60 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    {t('contact.field_email')} *
                                                </label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={contactForm.email}
                                                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                                                    placeholder={t('contact.field_email')}
                                                    className="w-full px-4 py-3 bg-background/60 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    {t('contact.field_interest')} *
                                                </label>
                                                <select
                                                    required
                                                    value={contactForm.interest}
                                                    onChange={e => setContactForm(f => ({ ...f, interest: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-background/60 border border-border/60 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="" disabled>{t('contact.field_interest')}</option>
                                                    {t('contact.interest_options', { returnObjects: true }).map((opt, i) => (
                                                        <option key={i} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    {t('contact.field_message')} *
                                                </label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={contactForm.message}
                                                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                                                    placeholder={t('contact.field_message')}
                                                    className="w-full px-4 py-3 bg-background/60 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={contactStatus === 'submitting'}
                                                className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-primary text-white rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                                            >
                                                {contactStatus === 'submitting' ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        {t('contact.submitting')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={15} />
                                                        {t('contact.submit')}
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━ Footer ━━━ */}
            <footer className="border-t border-border/40 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div className="md:col-span-1">
                            <Link to="/" className="mb-4 inline-block">
                                <BrandLogo size="sm" />
                            </Link>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                {t('footer.tagline')}
                            </p>
                            <div className="flex items-center gap-3">
                                <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all">
                                    <Linkedin size={16} />
                                </a>
                                <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all">
                                    <Twitter size={16} />
                                </a>
                                <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all">
                                    <Mail size={16} />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.platform')}</h4>
                            <ul className="space-y-3">
                                {t('footer.platform_links', { returnObjects: true }).map(item => (
                                    <li key={item}>
                                        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.company')}</h4>
                            <ul className="space-y-3">
                                {t('footer.company_links', { returnObjects: true }).map(item => (
                                    <li key={item}>
                                        <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
                            <ul className="space-y-3">
                                {t('footer.legal_links', { returnObjects: true }).map(item => (
                                    <li key={item}>
                                        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="glow-line" />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} {t('footer.copyright')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {t('footer.bottomTagline')}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
