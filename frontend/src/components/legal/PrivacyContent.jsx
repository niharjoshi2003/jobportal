import React from 'react';

const Section = ({ title, children }) => (
    <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
);

const PrivacyContent = () => {
    return (
        <div className="space-y-8 text-sm">
            <Section title="Privacy Policy">
                <p>
                    We take privacy and issues concerning them seriously. Please go through the
                    following information to know about our privacy policies.
                </p>
                <p>
                    Job-O-Hire ("we", "our", "platform") recognizes that protecting personal
                    information is a fundamental responsibility, especially in a platform designed
                    to connect students and companies across borders. We are committed to maintaining
                    transparency, security, and trust while handling user data.
                </p>
                <p>
                    We collect personal information such as name, contact details, academic records,
                    resumes, project details, skills, and other relevant professional information when
                    users register or interact with the platform. Additionally, we may collect
                    system-related data such as IP address, browser information, and usage patterns
                    to enhance platform performance and user experience.
                </p>
                <p>
                    All personal data is collected and used strictly for legitimate purposes,
                    including facilitating recruitment processes, connecting candidates with
                    employers, improving platform services, and communicating relevant opportunities.
                    We ensure that personal information is not used beyond its intended purpose.
                </p>
                <p>
                    Job-O-Hire does not sell or misuse user data. However, information may be shared
                    with recruiting organizations, institutional partners, or trusted service
                    providers strictly for recruitment and platform operation purposes. In certain
                    cases, data may also be disclosed if required under applicable laws or to protect
                    user safety.
                </p>
                <p>
                    We implement strong organizational, technical, and security measures to prevent
                    unauthorized access, data loss, or misuse. Our systems are continuously monitored
                    and improved to align with evolving technology standards and regulatory
                    requirements.
                </p>
                <p>
                    Users have full rights over their personal data, including the ability to access,
                    update, correct, or request deletion of their information. Requests related to
                    personal data will be handled promptly and transparently.
                </p>
                <p>
                    We retain personal data only for as long as necessary to fulfill the purposes
                    outlined in this policy. This policy may be updated periodically to reflect
                    changes in legal, technological, or business environments.
                </p>
                <div className="pt-2 text-xs text-muted-foreground/80">
                    <p>Date of enactment: May 4, 2026</p>
                    <p>Last revised: May 4, 2026</p>
                    <p className="mt-1">Personal information protection manager:</p>
                    <p>Founder &mdash; Rupesh Jahagirdar</p>
                    <p>Contact: <a href="mailto:collaboration@jobohire.com" className="text-primary hover:underline">collaboration@jobohire.com</a></p>
                </div>
            </Section>

            <Section title="Terms of Service">
                <p>
                    By accessing and using Job-O-Hire, users agree to comply with the terms and
                    conditions outlined below. The platform is designed to connect students,
                    graduates, and companies for early-career hiring opportunities.
                </p>
                <p>
                    Users are required to provide accurate, complete, and up-to-date information
                    during registration and throughout their use of the platform. Any false,
                    misleading, or fraudulent information may result in suspension or termination of
                    access.
                </p>
                <p>
                    Job-O-Hire acts solely as an intermediary platform facilitating connections
                    between candidates and employers. We do not guarantee employment, internships, or
                    hiring outcomes, as final decisions are made by the respective organizations.
                </p>
                <p>
                    Users are responsible for maintaining the confidentiality of their account
                    credentials and for all activities conducted under their accounts. Any
                    unauthorized use must be reported immediately.
                </p>
                <p>
                    The platform must not be used for unlawful activities, misuse of data, or any
                    behavior that disrupts platform integrity. Job-O-Hire reserves the right to
                    restrict or terminate access in case of policy violations.
                </p>
                <p>
                    We are not liable for decisions made by employers, outcomes of recruitment
                    processes, or disputes arising between users and third parties. Users acknowledge
                    that participation in recruitment processes is at their own discretion.
                </p>
            </Section>

            <Section title="Cookie Policy">
                <p>
                    Job-O-Hire uses cookies and similar tracking technologies to enhance functionality
                    and user experience. Cookies are small data files stored on a user's device that
                    help improve performance and personalize interactions.
                </p>
                <p>
                    We use cookies to maintain secure login sessions, analyze traffic patterns,
                    understand user behavior, and improve platform usability. These insights help us
                    continuously optimize our services.
                </p>
                <p>
                    Users have the option to manage or disable cookies through their browser settings.
                    However, restricting cookies may impact certain features and overall platform
                    performance.
                </p>
            </Section>

            <Section title="GDPR Compliance">
                <p>
                    Job-O-Hire adheres to international data protection standards, including the
                    General Data Protection Regulation (GDPR), to ensure responsible handling of
                    personal data.
                </p>
                <p>
                    We process personal data based on clear legal grounds, including user consent,
                    legitimate business interests, and compliance with legal obligations. All data
                    processing is conducted transparently and for defined purposes.
                </p>
                <p>
                    Users have the right to access their personal data, request corrections, request
                    deletion (right to be forgotten), restrict data processing, and obtain their data
                    in a structured format. We are committed to honoring these rights in a timely and
                    efficient manner.
                </p>
                <p>
                    In cases where data is transferred across borders, we ensure appropriate
                    safeguards are implemented to maintain data security and compliance with
                    applicable regulations.
                </p>
                <p>
                    For GDPR-related requests or concerns, users can contact{' '}
                    <a href="mailto:collaborations@jobohire.com" className="text-primary hover:underline">
                        collaborations@jobohire.com
                    </a>.
                </p>
            </Section>
        </div>
    );
};

export default PrivacyContent;
