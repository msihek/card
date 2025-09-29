import pygame
import sys

# Initialize Pygame
pygame.init()

# Set up the display
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Pygame Learning - Pong Game")


def exit_game():
    pygame.quit()
    sys.exit()

clock = pygame.time.Clock()
tile_img = pygame.image.load("pygame/background.webp").convert()
tile_size = (250, 200)  # Set your desired tile size
tile_img = pygame.transform.scale(tile_img, tile_size)

# Rectangle
paddle1_color = (255, 0, 0)  # Red
paddle2_color = (0, 0, 255)  # Blue
paddle1_pos = [0, 300]
paddle2_pos = [780, 300]
paddle_size = (20, 80)
# Ball
ball_color = (255, 255, 255)
ball_pos_float = [400.0, 300.0]
ball_size = (20, 20)
# Set initial ball speed
initial_ball_speed = [4.0, 4.0]
ball_speed = initial_ball_speed.copy()
# Walls
wall_color = (255, 255, 0)  # Yellow
wall1_pos = [0, 0]
wall_size = (10, 600)
wall2_pos = [width - wall_size[0], 0]

# Create transparent wall surfaces (after wall_size and wall positions are defined)
wall1_surface = pygame.Surface(wall_size, pygame.SRCALPHA)
wall1_surface.fill((255, 255, 0, 0))  # Yellow, alpha 100 (0-255)

wall2_surface = pygame.Surface(wall_size, pygame.SRCALPHA)
wall2_surface.fill((255, 255, 0, 0))  # Yellow, alpha 100 (0-255)

# Points
points1 = 0
points2 = 0
font = pygame.font.Font(None, 36)

# Game loop
running = True
while running:
    # Check for events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    for x in range(0, width, tile_size[0]):
        for y in range(0, height, tile_size[1]):
            screen.blit(tile_img, (x, y))
    # Move the rectangle
    keys = pygame.key.get_pressed()
    if keys[pygame.K_w]:
        paddle1_pos[1] -= 10  # Move up
    if keys[pygame.K_s]:
        paddle1_pos[1] += 10  # Move down
    if keys[pygame.K_UP]:
        paddle2_pos[1] -= 10  # Move up
    if keys[pygame.K_DOWN]:
        paddle2_pos[1] += 10  # Move down
    # Clamp paddles to screen
    paddle1_pos[1] = max(0, min(paddle1_pos[1], height - paddle_size[1]))
    paddle2_pos[1] = max(0, min(paddle2_pos[1], height - paddle_size[1]))

    # Move the ball using floats
    ball_pos_float[0] += ball_speed[0]
    ball_pos_float[1] += ball_speed[1]

    # Clamp float position to screen bounds
    ball_pos_float[0] = max(0, min(ball_pos_float[0], width - ball_size[0]))
    ball_pos_float[1] = max(0, min(ball_pos_float[1], height - ball_size[1]))

    # Use int position for drawing and collision
    ball_pos = [int(ball_pos_float[0]), int(ball_pos_float[1])]

    # Draw everything
    paddle1_rect = pygame.Rect(paddle1_pos, paddle_size)
    paddle2_rect = pygame.Rect(paddle2_pos, paddle_size)
    wall1_rect = pygame.Rect(wall1_pos, wall_size)
    wall2_rect = pygame.Rect(wall2_pos, wall_size)
    outline_color = (0, 0, 0)  # Black outline
    outline_rect = pygame.Rect(ball_pos[0] - 2, ball_pos[1] - 2, ball_size[0] + 4, ball_size[1] + 4)
    pygame.draw.ellipse(screen, outline_color, outline_rect)
    pygame.draw.ellipse(screen, ball_color, pygame.Rect(ball_pos, ball_size))
    paddle1 = pygame.draw.rect(screen, paddle1_color, paddle1_rect)
    paddle2 = pygame.draw.rect(screen, paddle2_color, paddle2_rect)
    screen.blit(wall1_surface, wall1_pos)
    screen.blit(wall2_surface, wall2_pos)

    # Draw score text centered
    score1_text = font.render(str(points1), True, (255, 0, 0))
    score2_text = font.render(str(points2), True, (0, 0, 255))
    score1_rect = score1_text.get_rect(center=(width // 2 - 30, height // 2))
    score2_rect = score2_text.get_rect(center=(width // 2 + 30, height // 2))
    screen.blit(score1_text, score1_rect)
    screen.blit(score2_text, score2_rect)

    # Ball collision rect
    ball_rect = pygame.Rect(ball_pos, ball_size)

    # Collision with paddles
    if ball_rect.colliderect(paddle1_rect) or ball_rect.colliderect(paddle2_rect):
        ball_speed[0] = -ball_speed[0] * 1.01  # Reverse and increase speed
        ball_speed[1] = ball_speed[1] * 1.01   # Just increase speed, keep direction

    # Collision with left/right walls
    if ball_rect.colliderect(wall1_rect):
        ball_pos_float = [400.0, 300.0]
        points2 += 1
        ball_speed[0] = abs(ball_speed[0]) * 1.04
        ball_speed[1] = abs(ball_speed[1]) * 1.04 if ball_speed[1] >= 0 else -abs(ball_speed[1]) * 1.04
        ball_speed[0] = +ball_speed[0]  # Ball moves right after reset
        ball_speed[1] = +ball_speed[1]
    if ball_rect.colliderect(wall2_rect):
        ball_pos_float = [400.0, 300.0]
        points1 += 1
        ball_speed[0] = -abs(ball_speed[0]) * 1.04
        ball_speed[1] = abs(ball_speed[1]) * 1.04 if ball_speed[1] >= 0 else -abs(ball_speed[1]) * 1.04
        ball_speed[0] = -ball_speed[0]  # Ball moves left after reset
        ball_speed[1] = +ball_speed[1]

    # Win conditions
    if points1 >= 10:
        points1 = 0
        points2 = 0 
        ball_pos_float = [400.0, 300.0]
        ball_speed = initial_ball_speed.copy()
        winner_text = font.render("Player 1 Wins!", True, (255, 0, 0))
        winner_rect = winner_text.get_rect(center=(width // 2, height // 2.5))
        screen.blit(winner_text, winner_rect)
        pygame.display.flip()
        pygame.time.wait(2000)

    if points2 >= 10:
        points1 = 0
        points2 = 0 
        ball_pos_float = [400.0, 300.0]
        ball_speed = initial_ball_speed.copy()
        winner_text = font.render("Player 2 Wins!", True, (0, 0, 255))
        winner_rect = winner_text.get_rect(center=(width // 2, height // 2.5))
        screen.blit(winner_text, winner_rect)
        pygame.display.flip()
        pygame.time.wait(2000)

    # Collision with top/bottom screen edges
    if ball_pos[1] <= 0 or ball_pos[1] >= height - ball_size[1]:
        ball_speed[1] = -ball_speed[1]

    # Update the display
    pygame.display.flip()
    clock.tick(60)
    if keys[pygame.K_ESCAPE]:
        exit_game()


pygame.quit()
sys.exit()
