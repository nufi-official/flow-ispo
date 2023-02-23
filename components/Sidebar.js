import Link from 'next/link'
import {useRouter} from 'next/router'
import {
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material'
import {
  Apps as MyParticipationIcon,
  ManageSearch as ParticipationOfferingsIcon,
  Add as CreateISPOIcon,
  AccountBox as OverviewIcon,
  SettingsApplications as MyISPOIcon,
} from '@mui/icons-material'
const defaultSidebarWidth = 300

const navList = [
  {
    category: 'General',
    links: [
      {
        label: 'My Overview',
        href: '/',
        Icon: OverviewIcon,
      },
    ],
  },
  {
    category: 'ISPOS',
    links: [
      {
        label: 'Create ISPO',
        href: '/create',
        Icon: CreateISPOIcon,
      },
      {
        label: 'My ISPOS',
        href: '/my-ispos',
        Icon: MyISPOIcon,
      },
    ],
  },
  {
    category: 'Participate',
    links: [
      {
        label: 'My Participations',
        href: '/my-participations',
        Icon: MyParticipationIcon,
      },
      {
        label: 'Participation Offerings',
        href: '/participate',
        Icon: ParticipationOfferingsIcon,
      },
    ],
  },
]

export default function Sidebar(props) {
  const router = useRouter()
  return (
    <Drawer
      sx={{
        width: props.width || defaultSidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: props.width || defaultSidebarWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar sx={{justifyContent: 'center', px: {md: 2}}}>
        <b>FLOW ISPO</b>
      </Toolbar>

      <List sx={{px: 2}}>
        {navList.map(({category, links}, index) => (
          <Box key={category} pb={2}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.disabled',
                fontWeight: 'bold',
                pb: 1,
              }}
            >
              {category}
            </Typography>
            <Divider />
            {links.map(({label, href, Icon}) => (
              <ListItem key={label + href}>
                <ListItemButton
                  component={Link}
                  href={href}
                  selected={router.pathname === href}
                  sx={{borderRadius: ({shape}) => shape.borderRadius}}
                >
                  <ListItemIcon sx={{minWidth: '40px'}}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>
    </Drawer>
  )
}
