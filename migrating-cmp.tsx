import React from 'react'
import { Popover, Button, Switch, theme, Flex, Typography } from 'antd'
import { IconAdjustmentsHorizontal } from '@tabler/icons-react'

const SettingsPopover = ({ entityDisplayMode, handleSwitch, keyToUpdate }: any) => {
  const { token } = theme.useToken()
  const { Text } = Typography

  const popoverContent = (
    <Flex align='center' gap='small'>
      <Switch
        size='small'
        checked={entityDisplayMode?.showNodeType}
        onChange={(checked) => handleSwitch({ keyToUpdate: 'showNodeType', switchValue: checked })}
      />
      <Text>הצגת סוג רכיב על גביי ישות</Text>
    </Flex>
  )

  return (
    <Popover content={popoverContent} trigger='click' placement='bottom' overlayStyle={{ width: 300 }}>
      <Button
        // Tabler icon used here
        icon={<IconAdjustmentsHorizontal size={18} />}
        iconPosition='end'
        style={{
          borderColor: '#1e3a8ab2',
          color: token.colorPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        התאמה אישית
      </Button>
    </Popover>
  )
}

export default SettingsPopover

import React from 'react'
import { Breadcrumb, Spin, theme, Typography } from 'antd'
import { IconChevronLeft, IconHome } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

const NavigationPath = ({ nodePath, routePrefix, nodePathData, breadcrumbPaths, searchParams }: any) => {
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const { Link } = Typography

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    navigate(`${routePrefix ? routePrefix : ''}${path}?${searchParams}`)
  }

  // 1. Home Item with Tabler Icon
  const homeItem = {
    title: (
      <IconHome
        size={17}
        color={token.colorPrimary}
        style={{ cursor: 'pointer', verticalAlign: 'middle' }}
        onClick={(e) => handleNav(e, breadcrumbPaths[1])}
      />
    ),
  }

  // 2. Dynamic Items
  const dynamicItems = nodePathData
    ?.map((breadcrumb: any, index: number) => {
      if (index <= 1) return null

      let content
      if (breadcrumb.isFetching) {
        content = <Spin size='small' />
      } else if (breadcrumb.isError) {
        content = <span>{breadcrumb.data?.displayName}</span>
      } else {
        content = <span>{nodePath.slice(0)[index]}</span>
      }

      return {
        title: (
          <Link
            style={{ color: token.colorPrimary, display: 'flex', alignItems: 'center' }}
            onClick={(e) => handleNav(e, breadcrumbPaths[index])}
          >
            {content}
          </Link>
        ),
      }
    })
    .filter(Boolean)

  const items = [homeItem, ...(dynamicItems || [])]

  return (
    <Breadcrumb
      // Tabler Separator Icon
      separator={<IconChevronLeft size={12} style={{ marginTop: 4, color: token.colorTextSecondary }} />}
      items={items}
      style={{ margin: 4 }}
    />
  )
}

export default NavigationPath
