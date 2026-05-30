"use client"

import { AnimatedHero } from "@/components/ui/animated-hero-section-1";
import { Button } from "@/components/ui/button";
import { MountainIcon } from "lucide-react";

export default function AnimatedHeroDemo() {
  const navLinks = [
    { label: "Solutions", href: "#" },
    { label: "Working", href: "#" },
    { label: "Discover", href: "#" },
  ];

  const handleCtaClick = () => {
    alert("Primary CTA clicked!");
  };
  
  const handleSecondaryCtaClick = () => {
    alert("Secondary CTA clicked!");
  };

  return (
    <AnimatedHero
      backgroundImageUrl="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2FsbHBhcGVyfGVufDB8fDB8fHww?q=80&w=2940&auto=format&fit=crop"
      logo={
        <>
          <MountainIcon className="h-6 w-6 text-primary-foreground" />
          <span className="font-semibold text-primary-foreground">TwentyFirst</span>
        </>
      }
      navLinks={navLinks}

      // UPDATED: The top-right button now uses the same glass style for consistency
      topRightAction={
        <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground hover:bg-white/20">
          Get Consultation
        </Button>
      }

      title="Take Charge of your Generation Now"
      description="Lead with purpose, build boldly, and shape the future—your generation's moment is now. Own it. Drive it."
      
      ctaButton={{
        text: "Learn More",
        onClick: handleCtaClick,
      }}

      secondaryCta={{
        text: "Contact Us",
        onClick: handleSecondaryCtaClick,
      }}
    />
  );
}
