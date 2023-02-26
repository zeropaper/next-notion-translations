import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { Anchor, AnchorProps } from '@mantine/core';
import { forwardRef, PropsWithChildren } from "react";
import useTranslation from "next-translate/useTranslation";

export interface LinkProps extends PropsWithChildren<NextLinkProps>, AnchorProps {
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({
  ...props }, ref) => {
  const { lang } = useTranslation()

  return (
    <NextLink locale={lang} {...props} ref={ref} />
  );
})

Link.displayName = 'Link';

export default Link