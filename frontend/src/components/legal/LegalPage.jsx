import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PrivacyContent from './PrivacyContent';
import BrandLogo from '../shared/BrandLogo';

const LegalPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <BrandLogo size="sm" />
                    </Link>
                    <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={16} /> Back home
                    </Link>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-foreground mb-2">Privacy & Terms</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Please review how we handle your data and the rules that govern use of Job-O-Hire.
                </p>
                <div className="glass-card rounded-2xl p-6 md:p-8">
                    <PrivacyContent />
                </div>
            </main>
        </div>
    );
};

export default LegalPage;
