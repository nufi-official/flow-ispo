import Card from './Card'
import {Box, Typography, Link, Chip, Divider} from '@mui/material'
import {lighten} from '@mui/system'
import {
  Launch as ExternalIcon,
  DateRange as CalendarIcon,
  RocketLaunch as Placeholder,
} from '@mui/icons-material'
import {formatCompactAmount} from '../helpers/utils'
import {useEpochToDate} from '../hooks/epochs'

const imageSize = 60
const imageRightSpace = 8

export default function ISPOCard(props) {
  // mock dates
  const getDateFromEpoch = useEpochToDate()

  return (
    <Card sx={{width: '400px', py: 2.5, px: 3.5}}>
      {props.name && (
        <Box sx={{display: 'flex'}}>
          {props.logoUrl ? (
            <img
              src={props.logoUrl}
              alt={props.name}
              width={imageSize}
              height={imageSize}
              style={{objectFit: 'cover', borderRadius: 8}}
            />
          ) : (
            <PlaceholderIcon name={props.name} />
          )}
          <Box
            ml={`${imageRightSpace}px`}
            width={`calc(100% - ${imageSize + imageRightSpace}px)`}
          >
            <Link
              href={props.projectUrl}
              disabled={true}
              target="_blank"
              sx={{
                display: 'inline-flex',
                gap: 0.5,
                alignItems: 'center',
                maxWidth: '100%',
                textDecoration: 'none',
                ...(!props.projectUrl ? {
                  pointerEvents: 'none',
                  cursor: 'default'
                } : {}),
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                noWrap
                title={props.name}
              >
                {props.name}
              </Typography>
              {props.projectUrl ? <ExternalIcon fontSize="medium" color="inherit" /> : <Box mr={1}/>}
            </Link>
            {props.epochStart && props.epochEnd && (
              <Box
                sx={({typography}) => ({
                  display: 'inline-flex',
                  gap: 1,
                  alignItems: 'center',
                  color: 'grey.700',
                  ...typography.caption,
                })}
              >
                <CalendarIcon color="inherit" fontSize="small" />
                <div>
                  {getDateFromEpoch(props.epochStart)
                    ?.toLocaleDateString()}{' '}
                  -{' '}
                  {getDateFromEpoch(props.epochEnd)
                    ?.toLocaleDateString()}
                </div>
              </Box>
            )}
          </Box>
        </Box>
      )}
      {props.body && props.body}
      {props.footerContent && (
        <>
          <Divider sx={{mt: 2, mb: 1, width: '200%', translate: -100}} />
          {props.footerContent}
        </>
      )}
    </Card>
  )
}

export function IspoDetail(props) {
  return (
    <Box
      sx={{
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        mb: 1,
      }}
    >
      <Typography variant="caption">{props.label}</Typography>
      <Typography variant="body1" fontWeight="bold">
        {props.value}{' '}
        <Typography variant="caption">
          {props.extraValue ? `(${props.extraValue})` : null}
        </Typography>
      </Typography>
    </Box>
  )
}

function PlaceholderIcon({name}) {
  const baseColor = stringToColor(name)
  return (
    <>
      <svg width={0} height={0}>
        <linearGradient id="linearColors" x1={1} y1={0} x2={1} y2={1}>
          <stop offset={0} stopColor={baseColor} />
          <stop offset={0.5} stopColor={lighten(baseColor, 0.5)} />
          <stop offset={1} stopColor={lighten(baseColor, 0.7)} />
        </linearGradient>
      </svg>
      <Placeholder sx={{width: 60, height: 60, fill: 'url(#linearColors)'}} />
    </>
  )
}

// generate placeholder image colors
// https://mui.com/material-ui/react-avatar/

function stringToColor(string) {
  let hash = 0
  let i

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#'

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }

  return color
}
