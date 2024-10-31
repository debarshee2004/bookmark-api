import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { SignInAuthDto, SignUpAuthDto } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmarks/dto';
import { PrismaOrmService } from 'src/prisma-orm/prisma-orm.service';
import { EditUserDto } from 'src/users/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaOrmService;

  beforeAll(async () => {
    // Create a testing module with the AppModule
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create a Nest application instance
    app = moduleRef.createNestApplication();
    // Use global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    // Initialize the application
    await app.init();
    // Start listening on port 3333
    await app.listen(3333);

    // Get Prisma service and clean the database
    prisma = app.get(PrismaOrmService);
    await prisma.cleanDB();
    // Set base URL for pactum requests
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    // Close the application after all tests
    await app.close();
  });

  describe('Auth', () => {
    const signupDto: SignUpAuthDto = {
      email: 'dino@gmail.com',
      password: '123',
      firstName: 'dino',
      lastName: 'codes',
    };
    const signinDto: SignInAuthDto = {
      email: 'dino@gmail.com',
      password: '123',
    };

    describe('Signup', () => {
      it('should throw if email empty', () => {
        // Test signup with empty email
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: signupDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        // Test signup with empty password
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signupDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        // Test signup with no body
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', () => {
        // Test successful signup
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email empty', () => {
        // Test signin with empty email
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: signinDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        // Test signin with empty password
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: signinDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        // Test signin with no body
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        // Test successful signin and store access token
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signinDto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        // Test getting current user
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Debarshee',
          email: 'dino@codewithdino.com',
        };
        // Test editing user details
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        // Test getting bookmarks when none exist
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      it('should create bookmark', () => {
        // Test creating a new bookmark
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        // Test getting bookmarks when one exists
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        // Test getting a bookmark by its ID
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        // Test editing a bookmark by its ID
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        // Test deleting a bookmark by its ID
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        // Test getting bookmarks when none exist after deletion
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
