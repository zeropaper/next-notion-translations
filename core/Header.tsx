import { createStyles, Header as MHeader, Container, Group, Burger, Paper, Transition, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ChangeLanguage from "./ChangeLanguage";
import useTranslation from 'next-translate/useTranslation';
import Link from './Link';
import { useRouter } from 'next/router';


const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 1,
  },

  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },

    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },
}));

interface HeaderResponsiveProps {
  links?: { link: string; label: string }[];
}

const defaultLinks = [
  { link: '/', label: 'Home' },
  { link: '/products', label: 'Products' },
  { link: '/about', label: 'About' },
  { link: '/contact', label: 'Contact' },
  { link: '/blog', label: 'Blog' },
];

export default function Header({ links = defaultLinks }: HeaderResponsiveProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes, cx } = useStyles();
  const { t } = useTranslation('core/Header')
  const router = useRouter()

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: router.asPath === link.link
      })}
    >
      {t(link.label)}
    </Link>
  ));

  return (
    <MHeader height={HEADER_HEIGHT} mb={120} className={classes.root}>
      <Container className={classes.header}>
        <Box>Logo here</Box>

        <Group spacing={5} className={classes.links}>
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>

        <ChangeLanguage />
      </Container>
    </MHeader>
  );
}