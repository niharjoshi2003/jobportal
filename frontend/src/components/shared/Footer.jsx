import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const Footer = () => {
    return (
        <footer className="border-t border-border py-8 bg-card">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <Link to="/" className="inline-flex items-center mb-1">
                            <BrandLogo size="sm" />
                        </Link>
                        <p className="text-sm text-muted-foreground">2026 Job-O-Hire. Connecting talent globally.</p>
                    </div>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {['Privacy', 'Terms', 'Contact'].map(link => (
                            <a key={link} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
