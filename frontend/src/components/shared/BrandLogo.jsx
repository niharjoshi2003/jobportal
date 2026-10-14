import logo from '@/assets/logo.png';

const sizeMap = {
    sm: {
        logo: 'h-8',
        title: 'text-base',
        subtitle: 'text-[10px]',
    },
    md: {
        logo: 'h-10',
        title: 'text-lg',
        subtitle: 'text-[11px]',
    },
    lg: {
        logo: 'h-12',
        title: 'text-xl',
        subtitle: 'text-xs',
    },
};

const BrandLogo = ({
    size = 'md',
    showWordmark = true,
    showTagline = false,
    className = '',
    titleClassName = '',
    variant = 'default',
}) => {
    const styles = sizeMap[size] || sizeMap.md;

    if (variant === 'dashboard') {
        return (
            <span className={`inline-flex shrink-0 items-center gap-3 select-none ${className}`}>
                <span aria-hidden="true" className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-white/15 shadow-sm">
                    {/* Frame the existing emblem without shrinking the full logo canvas. */}
                    <img src={logo} alt="" className="absolute left-[-75px] top-[-33px] w-[208px] max-w-none h-auto" />
                </span>
                {showWordmark && (
                    <span className="flex flex-col gap-1">
                        <span className={`whitespace-nowrap text-base font-bold tracking-tight leading-none ${titleClassName}`}>
                            <span className="text-orange-400">Job</span><span className="text-sky-400">-O-</span><span className="text-lime-400">Hire</span>
                        </span>
                        {showTagline && <span className="text-[9px] tracking-wide text-muted-foreground">Unlocking Latent Talent</span>}
                    </span>
                )}
            </span>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
            <img
                src={logo}
                alt="Job-O-Hire logo"
                className={`${styles.logo} w-auto drop-shadow-[0_4px_16px_rgba(124,58,237,0.25)]`}
            />
            {showWordmark && (
                <div className="leading-tight">
                    <p className={`font-bold tracking-tight text-foreground ${styles.title} ${titleClassName}`}>
                        Job-O-Hire
                    </p>
                    {showTagline && (
                        <p className={`text-muted-foreground uppercase tracking-[0.12em] ${styles.subtitle}`}>
                            Unlocking Latent Talent
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrandLogo;

