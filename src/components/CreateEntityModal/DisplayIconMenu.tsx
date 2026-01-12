import { Row, Col, Typography, Button } from 'antd'
import type { IconType } from 'react-icons'
import type { SystemDefinition } from '../../types/entity'
import { resolveIcon } from './iconRegistry'

const { Text } = Typography

interface DisplayIconMenuProps {
  systems: Record<string, SystemDefinition>
  allowedSystemIds: string[]
  selectedSystem: string | null
  selectedIconId?: string | null
  onSystemSelect?: (systemId: string) => void
  onIconSelect?: (systemId: string, iconName?: string) => void
  fallbackSystemIcon: IconType
}

export function DisplayIconMenu({
  systems,
  allowedSystemIds,
  selectedSystem,
  selectedIconId,
  onSystemSelect,
  onIconSelect,
  fallbackSystemIcon,
}: DisplayIconMenuProps) {
  const visibleSystems = allowedSystemIds
    .map((id) => systems[id])
    .filter((system): system is SystemDefinition => Boolean(system))

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {visibleSystems.length === 0 ? (
        <div style={{ width: '100%', textAlign: 'right' }}>
          <Text type='secondary'>No display templates configured yet.</Text>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            border: '1px solid rgb(11, 95, 255)',
            borderRadius: 16,
            padding: '12px 16px',
          }}
        >
          <Row gutter={[12, 12]} justify='center'>
            {visibleSystems.map((system) => {
              const Icon = resolveIcon(system.icon) ?? fallbackSystemIcon
              const iconName = system.icon
              // Check if selected - icon could be stored as iconName or system.id
              const isSelected =
                selectedIconId === iconName ||
                selectedIconId === system.id ||
                (selectedSystem === system.id && !selectedIconId)

              return (
                <Col key={system.id}>
                  <Button
                    type='text'
                    aria-label={system.label}
                    onClick={() => {
                      if (onIconSelect) {
                        onIconSelect(system.id, iconName)
                      } else {
                        onSystemSelect?.(system.id)
                      }
                    }}
                    title={system.label}
                    style={{
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? 'rgba(11, 95, 255, 0.3)' : 'rgba(11, 95, 255, 0.3)'}`,
                      padding: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      boxShadow: isSelected ? '0 0 0 1px rgba(11, 95, 255, 0.18)' : undefined,
                      backgroundColor: isSelected ? 'rgba(11, 95, 255, 0.08)' : '#fff',
                    }}
                  >
                    <Icon size={22} />
                  </Button>
                </Col>
              )
            })}
          </Row>
        </div>
      )}
    </div>
  )
}
