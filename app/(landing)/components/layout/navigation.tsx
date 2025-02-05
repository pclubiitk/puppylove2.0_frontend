import * as React from 'react';
import { HStack } from '@chakra-ui/react';

import { useRouter } from 'next/navigation';

import siteConfig from '../data/config';

import { NavLink } from '../nav-link';

import { useScrollSpy } from '../../hooks/use-scrollspy';

import { MobileNavButton } from '../mobile-nav';
import { MobileNavContent } from '../mobile-nav';
import { useDisclosure, useUpdateEffect } from '@chakra-ui/react';

// import ThemeToggle from './theme-toggle';

const Navigation: React.FC = () => {
  const mobileNav = useDisclosure();
  const router = useRouter();
  const activeId = useScrollSpy(
    siteConfig.header.links
      .filter(({ id }) => id)
      .map(({ id }) => `[id="${id}"]`),
    {
      threshold: 0.75,
    }
  );

  const mobileNavBtnRef = React.useRef<HTMLButtonElement>(null);

  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus();
  }, [mobileNav.isOpen]);

  return (
    <HStack spacing="0" flexShrink={0}>
      {siteConfig.header.links.map(({ id, ...props }, i) => {
        return (
          <NavLink
            display={['none', null, 'block']}
            href={`/${id}`}
            key={i}
            isActive={
              !!(
                (id && activeId === id)
                // (href && !!router.asPath.match(new RegExp(href)))
              )
            }
            {...props}
            fontSize="lg"
          >
            {props.label}
          </NavLink>
        );
      })}

      {/* <ThemeToggle /> */}

      <MobileNavButton
        ref={mobileNavBtnRef}
        aria-label="Open Menu"
        onClick={mobileNav.onOpen}
      />

      <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} />
    </HStack>
  );
};

export default Navigation;
