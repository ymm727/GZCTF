import {
  Avatar,
  Badge,
  Center,
  Group,
  Input,
  LoadingOverlay,
  Modal,
  ModalProps,
  Progress,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import dayjs from 'dayjs'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import TeamRadarMap from '@Components/TeamRadarMap'
import { BonusLabel } from '@Utils/Shared'
import { useTableStyles } from '@Utils/ThemeOverride'
import { ChallengeInfo, ScoreboardItem, SubmissionType } from '@Api'

interface MobileScoreboardItemModalProps extends ModalProps {
  item?: ScoreboardItem | null
  bloodBonusMap: Map<SubmissionType, BonusLabel>
  challenges?: Record<string, ChallengeInfo[]>
}

const MobileScoreboardItemModal: FC<MobileScoreboardItemModalProps> = (props) => {
  const { item, challenges, ...modalProps } = props
  const { classes } = useTableStyles()

  const { t } = useTranslation()

  const challengeIdMap =
    challenges &&
    Object.keys(challenges).reduce((map, key) => {
      challenges[key].forEach((challenge) => {
        map.set(challenge.id!, challenge)
      })
      return map
    }, new Map<number, ChallengeInfo>())

  const solved = (item?.solvedCount ?? 0) / (item?.challenges?.length ?? 1)

  const indicator =
    challenges &&
    Object.keys(challenges).map((tag) => ({
      name: tag,
      scoreSum: challenges[tag].reduce((sum, chal) => sum + (!chal.solved ? 0 : chal.score!), 0),
      max: 1,
    }))

  const values = new Array(item?.challenges?.length ?? 0).fill(0)

  item?.challenges?.forEach((chal) => {
    if (indicator && challengeIdMap && chal) {
      const challenge = challengeIdMap.get(chal.id!)
      const index = challenge && indicator?.findIndex((ch) => ch.name === challenge.tag)
      if (chal?.score && challenge?.score && index !== undefined && index !== -1) {
        values[index] += challenge?.score / indicator[index].scoreSum
      }
    }
  })

  return (
    <Modal
      {...modalProps}
      title={
        <Group justify="left" gap="md" wrap="nowrap">
          <Avatar alt="avatar" src={item?.avatar} size={50} radius="md" color="brand">
            {item?.name?.slice(0, 1) ?? 'T'}
          </Avatar>
          <Stack gap={0}>
            <Group gap={4}>
              <Title order={4} lineClamp={1}>
                {item?.name ?? 'Team'}
              </Title>
              {item?.organization && (
                <Badge size="sm" variant="outline">
                  {item.organization}
                </Badge>
              )}
            </Group>
            <Text truncate size="sm" lineClamp={1}>
              {item?.bio || t('team.placeholder.bio')}
            </Text>
          </Stack>
        </Group>
      }
    >
      <Stack align="center" gap="xs">
        <Stack w="60%" miw="20rem">
          <Center h="14rem">
            <LoadingOverlay visible={!indicator || !values} />
            {item && indicator && values && (
              <TeamRadarMap indicator={indicator} value={values} name={item?.name ?? ''} />
            )}
          </Center>
          <Group grow ta="center">
            <Stack gap={1}>
              <Text fw={700} size="sm" className={classes.mono}>
                {item?.rank}
              </Text>
              <Text size="xs">{t('game.label.score_table.rank_total')}</Text>
            </Stack>
            {item?.organization && (
              <Stack gap={1}>
                <Text fw={700} size="sm" className={classes.mono}>
                  {item?.organizationRank}
                </Text>
                <Text size="xs">{t('game.label.score_table.rank_organization')}</Text>
              </Stack>
            )}
            <Stack gap={1}>
              <Text fw={700} size="sm" className={classes.mono}>
                {item?.score}
              </Text>
              <Text size="xs">{t('game.label.score_table.score')}</Text>
            </Stack>
            <Stack gap={1}>
              <Text fw={700} size="sm" className={classes.mono}>
                {item?.solvedCount}
              </Text>
              <Text size="xs">{t('game.label.score_table.solved_count')}</Text>
            </Stack>
          </Group>
          <Progress value={solved * 100} size="sm" />
        </Stack>
        {item?.solvedCount && item?.solvedCount > 0 ? (
          <ScrollArea scrollbarSize={6} h="12rem" w="100%">
            <Table
              className={classes.table}
              style={{
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr>
                  <th style={{ minWidth: '3rem' }}>{t('common.label.challenge')}</th>
                  <th style={{ minWidth: '3rem' }}>{t('game.label.score_table.score')}</th>
                  <th style={{ minWidth: '3rem' }}>{t('common.label.time')}</th>
                </tr>
              </thead>
              <tbody>
                {item?.challenges &&
                  challengeIdMap &&
                  item.challenges
                    .filter((c) => c.type !== SubmissionType.Unaccepted)
                    .sort((a, b) => dayjs(b.time).diff(dayjs(a.time)))
                    .map((chal) => {
                      const info = challengeIdMap.get(chal.id!)
                      return (
                        <tr key={chal.id}>
                          <td>
                            <Input
                              variant="unstyled"
                              value={info?.title}
                              readOnly
                              size="sm"
                              sx={{
                                wrapper: {
                                  width: '100%',
                                },

                                input: {
                                  userSelect: 'none',
                                  fontSize: '0.85rem',
                                  lineHeight: '0.9rem',
                                  height: '0.9rem',
                                  fontWeight: 500,

                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                },
                              }}
                            />
                          </td>
                          <td className={classes.mono}>{chal.score}</td>
                          <td className={classes.mono}>{dayjs(chal.time).format('MM/DD HH:mm')}</td>
                        </tr>
                      )
                    })}
              </tbody>
            </Table>
          </ScrollArea>
        ) : (
          <Text py="1rem" fw={700}>
            {t('game.placeholder.no_solved')}
          </Text>
        )}
      </Stack>
    </Modal>
  )
}

export default MobileScoreboardItemModal
