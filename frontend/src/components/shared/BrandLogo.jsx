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
}) => {
    const styles = sizeMap[size] || sizeMap.md;

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

