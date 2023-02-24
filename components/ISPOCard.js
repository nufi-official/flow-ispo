import Card from './Card'
import {Box, Typography, Link, Chip, Divider} from '@mui/material'
import {lighten} from '@mui/system'
import {
  Launch as ExternalIcon,
  DateRange as CalendarIcon,
  RocketLaunch as Placeholder,
} from '@mui/icons-material'
import {formatCompactAmount} from '../helpers/utils'
import { useEpochToDate } from '../hooks/epochs'

export default function ISPOCard(props) {
  // mock dates
  const getDateFromEpoch = useEpochToDate()

  const getRewardPerEpoch = (totalRewardBalance, epochStart, epochEnd) =>
    totalRewardBalance / (epochEnd - epochStart)

  return (
    <Card sx={{width: '400px', py: 2}}>
      {props.name && (
        <Box sx={{display: 'flex'}}>
          {props.imgSrc ? (
            <img
              src={props.imgSrc}
              alt={props.name}
              width={60}
              height={60}
              style={{objectFit: 'cover', borderRadius: 8}}
            />
          ) : (
            <PlaceholderIcon name={props.name} />
          )}
          <Box ml={2}>
            <Typography variant="h6" fontWeight="bold">
              {props.name}
            </Typography>
            {props.projectWebsite && (
              <Link
                href={props.projectWebsite}
                target="_blank"
                sx={{display: 'inline-flex', gap: 1, alignItems: 'center'}}
              >
                {props.projectWebsite}
                <ExternalIcon fontSize="inherit" color="inherit" />
              </Link>
            )}
          </Box>
        </Box>
      )}
      <Box
        sx={({typography}) => ({
          display: 'flex',
          gap: 4,
          justifyContent: 'space-between',
          color: 'grey.700',
          my: 1,
          ...typography.caption,
          fontWeight: 'bold',
        })}
      >
        {props.epochStart && props.epochEnd && (
          <Box
            sx={{
              display: 'inline-flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <CalendarIcon color="inherit" fontSize="small" />
            <div>
              {getDateFromEpoch(props.epochStart)?.toLocaleDateString().padStart(10, '0')} -{' '}
              {getDateFromEpoch(props.epochEnd)?.toLocaleDateString().padStart(10, '0')}
            </div>
          </Box>
        )}
        {props.rewardTokenBalance && props.epochStart && props.epochEnd && (
          <Chip
            size="small"
            label={
              <Typography
                variant="caption"
                fontWeight="bold"
              >{`${formatCompactAmount(
                getRewardPerEpoch(
                  parseInt(props.rewardTokenBalance),
                  props.epochStart,
                  props.epochEnd,
                ),
              )} tokens / epoch`}</Typography>
            }
          />
        )}
      </Box>
      {props.body && props.body}
      {props.footerContent && (
        <>
          <Divider sx={{my: 1}} />
          {props.footerContent}
        </>
      )}
    </Card>
  )
}

export function IspoDetail(props) {
  return (
    <Box
      sx={({typography}) => ({
        ...typography.caption,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 1,
      })}
    >
      {props.label}
      <Chip
        label={props.value}
        variant={props.highlight ? 'gradient' : 'outlined'}
        size={props.highlight ? 'medium' : 'small'}
      />
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
 